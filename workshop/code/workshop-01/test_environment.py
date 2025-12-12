#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Workshop 01: Test Environment
Verify all dependencies and connections are working
"""

import sys
import os
from datetime import datetime

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_imports():
    """Test if all required packages can be imported"""
    print("Testing Python package imports...")
    packages = {
        "paho.mqtt": "paho-mqtt",
        "influxdb_client": "influxdb-client",
        "requests": "requests",
        "dotenv": "python-dotenv"
    }
    
    failed = []
    for module, package in packages.items():
        try:
            __import__(module)
            print(f"  [OK] {package}")
        except ImportError:
            print(f"  [FAIL] {package} - NOT INSTALLED")
            failed.append(package)
    
    return len(failed) == 0

def test_environment_variables():
    """Test if environment variables can be loaded"""
    print("\nTesting environment variables...")
    try:
        from dotenv import load_dotenv
        import os
        
        load_dotenv()
        
        vars_to_check = [
            "MQTT_BROKER",
            "INFLUXDB_URL",
            "FLASK_API_URL"
        ]
        
        all_present = True
        for var in vars_to_check:
            value = os.getenv(var)
            if value:
                print(f"  [OK] {var} = {value}")
            else:
                print(f"  [WARN] {var} - not set (using default)")
        
        return True
    except Exception as e:
        print(f"  [FAIL] Error loading environment: {e}")
        return False

def test_connections():
    """Test connections to services"""
    print("\nTesting service connections...")
    
    # Test MQTT
    try:
        import paho.mqtt.client as mqtt
        client = mqtt.Client()
        client.connect("localhost", 1883, 10)
        client.disconnect()
        print("  [OK] MQTT broker (localhost:1883)")
    except Exception as e:
        print(f"  [FAIL] MQTT broker - {e}")
    
    # Test InfluxDB
    try:
        from influxdb_client import InfluxDBClient
        client = InfluxDBClient(
            url="http://localhost:8086",
            token="test-token",
            org="test-org"
        )
        client.ping()
        print("  [OK] InfluxDB (localhost:8086)")
    except Exception as e:
        print(f"  [WARN] InfluxDB - {e} (may need correct credentials)")
    
    # Test Flask API
    try:
        import requests
        response = requests.get("http://localhost:5000/health", timeout=2)
        if response.status_code == 200:
            print("  [OK] Flask API (localhost:5000)")
        else:
            print(f"  [WARN] Flask API - Status {response.status_code}")
    except Exception as e:
        print(f"  [WARN] Flask API - {e} (service may not be running)")

def main():
    print("=" * 60)
    print("IoT Home Automation - Environment Test")
    print("=" * 60)
    print(f"Test Time: {datetime.now()}")
    print(f"Python: {sys.version.split()[0]}")
    print()
    
    # Run tests
    imports_ok = test_imports()
    env_ok = test_environment_variables()
    test_connections()
    
    print("\n" + "=" * 60)
    if imports_ok and env_ok:
        print("[OK] Environment test completed successfully!")
        print("You're ready to start the workshops!")
    else:
        print("[WARN] Some issues detected. Please review the output above.")
    print("=" * 60)

if __name__ == "__main__":
    main()

