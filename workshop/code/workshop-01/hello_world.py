#!/usr/bin/env python3
"""
Workshop 01: Hello World
Simple script to verify Python environment
"""

import sys
from datetime import datetime

def main():
    print("=" * 50)
    print("IoT Home Automation Learning Platform")
    print("Workshop 01: Introduction")
    print("=" * 50)
    print(f"Python Version: {sys.version}")
    print(f"Current Time: {datetime.now()}")
    print("Environment setup complete!")
    print("=" * 50)

if __name__ == "__main__":
    main()

