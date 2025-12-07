class DataAnalysisAgent:
    def analyze(self, vehicle_data: dict) -> dict:
        """
        Analyze telemetry data for anomalies.
        Returns a partial state update.
        """
        # Thresholds (Example values, can be tuned)
        BATTERY_TEMP_THRESHOLD = 45.0
        VIBRATION_THRESHOLD = 5.0  # Increased for less noise
        
        updates = {
            "anomaly_detected": False,
            "anomaly_reason": None,
            "severity": "Low",
            "rul": 100.0  # Default percentage or days
        }
        
        # Normalized keys from Stream Engine: 
        # "battery_temperature", "vibration_level", "motor_rpm", "velocity"
        
        battery_temp = vehicle_data.get("battery_temperature", 0)
        vibration = vehicle_data.get("vibration_level", 0)
        
        # Simple Rule-Based Detection
        if battery_temp > BATTERY_TEMP_THRESHOLD:
            updates["anomaly_detected"] = True
            updates["anomaly_reason"] = f"High Battery Temperature ({battery_temp}°C)"
            updates["severity"] = "High" if battery_temp > 60 else "Medium"
            updates["rul"] = 45.0 # RUL drops significantly
            
        elif vibration > VIBRATION_THRESHOLD:
            updates["anomaly_detected"] = True
            updates["anomaly_reason"] = f"High Vibration Detected ({vibration})"
            updates["severity"] = "Medium"
            updates["rul"] = 70.0
            
        return updates
