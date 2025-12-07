from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import logging

# Configure logging for UEBA
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("UEBA_AGENT")

class UEBAAgent:
    def __init__(self):
        # Allowable transitions: Source Node -> List[Target Node]
        # "START" is the conceptual entry point
        self.ALLOWED_TRANSITIONS = {
            "START": ["data_analysis"],
            "data_analysis": ["diagnosis", "end"], # 'end' matches LangGraph END
            "diagnosis": ["customer_engagement"],
            "customer_engagement": ["scheduling", "end"],
            "scheduling": ["rca", "end"],
            "rca": ["end"]
        }

    def check_transition(self, source: str, target: str) -> bool:
        """
        Validates if a transition from source node to target node is allowed.
        """
        # Normalize to lower case for comparison
        source = source.lower()
        target = target.lower()
        
        # If conceptual start of graph
        if source == "start":
            return target in self.ALLOWED_TRANSITIONS["START"]

        if source not in self.ALLOWED_TRANSITIONS:
            logger.warning(f"UEBA ALERT: Unknown source node '{source}' attempted transition.")
            return False
            
        is_allowed = target in self.ALLOWED_TRANSITIONS[source]
        
        if not is_allowed:
            logger.warning(f"UEBA SECURITY BLOCK: Illegal transition attempted from '{source}' to '{target}'.")
        else:
            logger.info(f"UEBA: Allowed transition '{source}' -> '{target}'.")
            
        return is_allowed

    async def log_attempt(self, db: Optional[AsyncSession], agent_name: str, source: str, target: str, status: str):
        """
        Logs the transition attempt to the database (if session provided) or stdout.
        """
        # In this prototype, we print to console if DB session is None
        log_entry = f"[UEBA LOG] Agent: {agent_name} | {source} -> {target} | Status: {status} | Time: {datetime.now()}"
        print(log_entry)
        
        # TODO: Implement actual DB insert when ueba_logs table is ready and session is passed
        # if db:
        #     log = UEBALog(...)
        #     db.add(log)
        #     await db.commit()
