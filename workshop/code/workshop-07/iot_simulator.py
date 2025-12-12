#!/usr/bin/env python3
"""
Workshop 07: IoT Simulator
Run the IoT device simulator
"""

import sys
import os

# Add simulator directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..', 'simulator'))

try:
    from iot_simulator import main
    if __name__ == "__main__":
        main()
except ImportError:
    print("Simulator not found. Run from simulator directory:")
    print("  cd simulator")
    print("  python iot_simulator.py")

