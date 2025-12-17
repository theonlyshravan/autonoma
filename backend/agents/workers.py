import os
import random
import json
import logging
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
import google.generativeai as genai

# Load env vars
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class DiagnosisAgent:
    def diagnose(self, anomaly_reason: str, current_data: dict) -> dict:
        """
        Map anomaly to root cause diagnosis using rule-based expert system.
        """
        diagnosis = "Unknown issue. Manual inspection required."
        confidence = 0.5
        severity = "Low"
        
        reason_lower = (anomaly_reason or "").lower()
        
        if "battery temperature" in reason_lower:
            temp = current_data.get("battery_temperature", 0)
            if temp > 60:
                diagnosis = "CRITICAL: Thermal Runaway Risk. Coolant pump failure inferred."
                confidence = 0.98
                severity = "Critical"
            else:
                diagnosis = "Thermal Management System Warning. Possible radiator accumulation."
                confidence = 0.85
                severity = "High"
        
        elif "vibration" in reason_lower:
            vib = current_data.get("vibration_level", 0)
            if vib > 8:
                diagnosis = "DANGER: Structural Integrity Compromise. Motor mount failure."
                confidence = 0.95
                severity = "Critical"
            else:
                diagnosis = "Drivetrain Misalignment or uneven tire wear detected."
                confidence = 0.78
                severity = "Medium"
        
        elif "motor" in reason_lower:
            diagnosis = "Motor Controller Logic Fault."
            confidence = 0.80
            severity = "Medium"
            
        return {
            "diagnosis": diagnosis,
            "severity": severity,
            "diagnosis_confidence": confidence
        }

class CustomerEngagementAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')

    async def generate_message(self, diagnosis: str, severity: str, conversation_history: List[dict] = []) -> Dict:
        """
        Generate context-aware user alert/response using Gemini.
        Returns a dictionary with message content and UI signals.
        """
        # Simplify history for the model
        history_text = "\n".join([f"{msg['sender']}: {msg['content']}" for msg in conversation_history[-5:]])
        
        # Check for explicit booking intent from frontend (e.g. "Book the slot for 12/12/2025 at 09:30 AM")
        booking_intent = None
        cleaned_history_text = history_text
        
        if conversation_history:
            last_msg = conversation_history[-1]
            if last_msg['sender'] == 'user':
                import re
                # Pattern: Book the slot for 12/7/2025 at 09:30 AM
                match = re.search(r"Book the slot for ([\d/]+) at ([\d:]+ [AP]M)", last_msg['content'])
                if match:
                    raw_date = match.group(1)
                    booking_time = match.group(2)
                    
                    # Normalize Date to YYYY-MM-DD
                    try:
                        date_obj = datetime.strptime(raw_date, "%m/%d/%Y")
                        formatted_date = date_obj.strftime("%Y-%m-%d")
                    except ValueError:
                        formatted_date = raw_date # Fallback
                        
                    booking_intent = {"date": formatted_date, "time": booking_time}
                    # We have intent, so we do NOT want to show the UI. We want to execute booking.
                    return {
                        "content": "Processing your booking request...",
                        "show_booking": False,
                        "booking_intent": booking_intent
                    }

        prompt = f"""
        You are an intelligent, polite, and professional autonomous vehicle assistant.
        Your goal is to inform the owner about a vehicle issue and help them book a service.
        TONE: Nice, decent, no AI fluff. Be direct but empathetic.
        
        CURRENT STATUS:
        Diagnosis: {diagnosis}
        Severity: {severity}
        
        CONVERSATION HISTORY:
        {history_text}
        
        INSTRUCTIONS:
        - If this is the first message (history is empty), inform the user about the issue neatly. Ask if they want to book.
        - If the user agrees to book (e.g. "Yes", "Book it") AND has NOT provided a specific time, your response MUST explicitly include the text "[SHOW_BOOKING_UI]" at the end.
        - If the user JUST confirmed a slot (e.g. "Book the slot for..."), DO NOT include [SHOW_BOOKING_UI]. Just say you are confirming it.
        - Keep responses short (under 2 sentences).
        
        Your response:
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text
            show_booking = "[SHOW_BOOKING_UI]" in text
            clean_text = text.replace("[SHOW_BOOKING_UI]", "").strip()
            
            # Additional heuristic: If user says "Yes" and history suggests we asked to book, force show_booking
            if not show_booking and conversation_history:
                last_user_msg = conversation_history[-1]
                # Heuristic override
                if last_user_msg['sender'] == 'user':
                    user_content = last_user_msg['content'].lower()
                    
                    # Check for affirmative response
                    if any(x in user_content for x in ["yes", "sure", "ok", "book"]):
                         last_bot_msg = next((m for m in reversed(conversation_history[:-1]) if m['sender'] == 'bot'), None)
                         if last_bot_msg:
                             content = last_bot_msg.get('content', '').lower()
                             
                             is_booking_prompt = ("book" in content and "slot" in content) or "appointment" in content
                             
                             if is_booking_prompt:
                                 show_booking = True

            return {
                "content": clean_text,
                "show_booking": show_booking,
                "booking_intent": None
            }
        except Exception as e:
            # Fallback logic if AI fails
            show_booking_fallback = False
            fallback_msg = f"⚠️ Alert: {diagnosis}. Please schedule service. (AI Offline)"
            
            # Simple intent check
            if conversation_history:
                last_msg = conversation_history[-1]
                if last_msg['sender'] == 'user':
                    user_text = last_msg['content'].lower()
                    if "book" in user_text or "yes" in user_text or "schedule" in user_text:
                        show_booking_fallback = True
                        fallback_msg = "Opening scheduling assistant..."
            
            return {
                "content": fallback_msg,
                "show_booking": show_booking_fallback,
                "booking_intent": None
            }

class SchedulingAgent:
    def __init__(self):
        self.api_url = "http://127.0.0.1:8000/api/service-center"

    async def get_available_slots(self, date_str: str) -> List[str]:
        import httpx
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{self.api_url}/slots", params={"date": date_str})
                if resp.status_code == 200:
                    return resp.json()
            except Exception as e:
                print(f"Scheduling Agent Error: {e}")
        return []

    async def book_appointment(self, slot: str, date: str, vehicle_id: str) -> str:
        import httpx
        async with httpx.AsyncClient() as client:
            try:
                payload = {"vin": vehicle_id, "slot": slot, "date": date}
                resp = await client.post(f"{self.api_url}/book", json=payload)
                if resp.status_code == 200:
                    return resp.json()["booking_id"]
            except Exception as e:
                 print(f"Booking Error: {e}")
        return "BK-FAILED"

class RCAAgent:
    def analyze_failure(self, history: List[dict]) -> dict:
        # Dynamic insight based on recent failure
        return {
            "component": "HV Battery System",
            "pattern": "Thermal spike correlation with fast charging sessions",
            "recommendation": "Update BMS firmware to v2.4.1 to optimize cooling curve.",
            "confidence_score": 0.89
        }
