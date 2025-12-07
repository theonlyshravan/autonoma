from typing import List, Dict, Optional
import random
from datetime import datetime, timedelta

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
    def generate_message(self, diagnosis: str, severity: str) -> str:
        """
        Generate context-aware user alert.
        """
        timestamp = datetime.now().strftime("%H:%M")
        
        if severity == "Critical":
            return f"[{timestamp}] 🛑 WARNING: {diagnosis}. Please stop vehicle safely and contact support."
        elif severity == "High":
            return f"[{timestamp}] ⚠️ ALERT: {diagnosis}. Service appointment recommended."
        elif severity == "Medium":
            return f"[{timestamp}] ℹ️ NOTICE: {diagnosis}. We will monitor this trend."
        else:
            return f"[{timestamp}] System Update: {diagnosis}"

class SchedulingAgent:
    def check_availability(self) -> List[str]:
        # Return next 3 slots
        base = datetime.now()
        slots = []
        for i in range(1, 4):
            slot = base + timedelta(days=i, hours=10)
            slots.append(slot.strftime("%Y-%m-%d %I:%00 %p"))
        return slots

    def book_appointment(self, slot: str, vehicle_id: str) -> str:
        # Generate mock Booking ID
        return f"BK-{random.randint(10000, 99999)}"

class RCAAgent:
    def analyze_failure(self, history: List[dict]) -> dict:
        # Dynamic insight based on recent failure
        return {
            "component": "HV Battery System",
            "pattern": "Thermal spike correlation with fast charging sessions",
            "recommendation": "Update BMS firmware to v2.4.1 to optimize cooling curve.",
            "confidence_score": 0.89
        }
