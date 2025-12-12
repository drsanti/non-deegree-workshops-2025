"""
Smart Switch Device Simulator
"""

import random
from datetime import datetime

class SmartSwitch:
    def __init__(self, device_id, location):
        self.device_id = device_id
        self.location = location
        self.device_type = "switch"
        self.state = False  # On/Off state
        
    def read(self):
        """Read switch state"""
        # Randomly toggle state occasionally
        if random.random() < 0.1:  # 10% chance to toggle
            self.state = not self.state
        
        return {
            'value': 1 if self.state else 0,
            'state': 'on' if self.state else 'off',
            'location': self.location,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def set_state(self, state):
        """Set switch state"""
        self.state = state

