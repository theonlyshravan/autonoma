import asyncio
import pandas as pd
import numpy as np
import json
from typing import AsyncGenerator, Dict, Any
import os

class StreamEngine:
    def __init__(self, file_path: str, delay_seconds: float = 2.0):
        self.file_path = file_path
        self.delay_seconds = delay_seconds
        self.df = None
        self.running = False
        self._load_data()

    def _load_data(self):
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"Dataset not found at: {self.file_path}")
        
        # Load CSV
        # Helper to normalize column names
        def normalize_col(col: str) -> str:
            # "Battery temperature [°C]" -> "battery_temperature"
            col = col.split('[')[0].strip().lower().replace(' ', '_')
            return col

        self.df = pd.read_csv(self.file_path)
        self.df.columns = [normalize_col(c) for c in self.df.columns]
        
        # Preprocessing
        self.df.fillna(0, inplace=True)

        # (Pandas ints/floats are not JSON serializable by default)

    async def stream_data(self) -> AsyncGenerator[Dict[str, Any], None]:
        self.running = True
        total_rows = len(self.df)
        current_index = 0

        while self.running:
            row = self.df.iloc[current_index]
            
            # Convert row to dict and handle numpy types
            row_dict = row.to_dict()
            for k, v in row_dict.items():
                if isinstance(v, (np.integer, np.int64)):
                    row_dict[k] = int(v)
                elif isinstance(v, (np.floating, np.float64)):
                    row_dict[k] = float(v)
            
            yield row_dict
            
            current_index = (current_index + 1) % total_rows
            await asyncio.sleep(self.delay_seconds)

    def stop(self):
        self.running = False
