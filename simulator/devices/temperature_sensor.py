"""
Temperature Sensor Device Simulator
"""

import random
from datetime import datetime

class TemperatureSensor:
    def __init__(self, device_id, location):
        self.device_id = device_id
        self.location = location
        self.device_type = "temperature"
        self.base_temp = 20.0  # Base temperature in Celsius
        self.variance = 5.0    # Temperature variance
        
    def read(self):
        """Read temperature value"""
        # Simulate temperature with some randomness
        temperature = self.base_temp + random.uniform(-self.variance, self.variance)
        
        return {
            'value': round(temperature, 2),
            'unit': 'celsius',
            'location': self.location,
            'timestamp': datetime.utcnow().isoformat()
        }

