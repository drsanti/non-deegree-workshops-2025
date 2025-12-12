#!/usr/bin/env python3
"""
Workshop 04: API Client
Basic client for interacting with Flask API
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_BASE_URL = os.getenv("FLASK_API_URL", "http://localhost:5000")

def get_api_info():
    """Get API information"""
    try:
        response = requests.get(f"{API_BASE_URL}/")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def check_health():
    """Check API health"""
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def main():
    print("=" * 60)
    print("Flask API Client Test")
    print("=" * 60)
    print(f"API URL: {API_BASE_URL}")
    print()
    
    # Test API info
    print("1. Getting API information...")
    info = get_api_info()
    if "error" in info:
        print(f"   ✗ Error: {info['error']}")
        print("   Make sure Flask API is running!")
    else:
        print("   ✓ API Information:")
        print(json.dumps(info, indent=2))
    
    print()
    
    # Test health
    print("2. Checking API health...")
    health = check_health()
    if "error" in health:
        print(f"   ✗ Error: {health['error']}")
    else:
        print("   ✓ Health Status:")
        print(json.dumps(health, indent=2))
    
    print()
    print("=" * 60)
    print("Next steps:")
    print("- Use api_examples.py for more API operations")
    print("- Check API documentation at http://localhost:5000")
    print("=" * 60)

if __name__ == "__main__":
    main()

