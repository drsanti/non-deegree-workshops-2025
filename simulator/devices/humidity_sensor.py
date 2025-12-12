"""
Humidity Sensor Device Simulator
"""

import random
from datetime import datetime

class HumiditySensor:
    def __init__(self, device_id, location):
        self.device_id = device_id
        self.location = location
        self.device_type = "humidity"
        self.base_humidity = 50.0  # Base humidity percentage
        self.variance = 15.0       # Humidity variance
        
    def read(self):
        """Read humidity value"""
        # Simulate humidity with some randomness
        humidity = self.base_humidity + random.uniform(-self.variance, self.variance)
        # Ensure humidity is between 0 and 100
        humidity = max(0, min(100, humidity))
        
        return {
            'value': round(humidity, 2),
            'unit': 'percent',
            'location': self.location,
            'timestamp': datetime.utcnow().isoformat()
        }

