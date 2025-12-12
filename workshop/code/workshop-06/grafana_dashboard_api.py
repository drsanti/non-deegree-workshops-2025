#!/usr/bin/env python3
"""
Workshop 06: Grafana Dashboard API
Create Grafana dashboards programmatically
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

GRAFANA_URL = os.getenv("GRAFANA_URL", "http://localhost:3000")
GRAFANA_USER = os.getenv("GRAFANA_USER", "admin")
GRAFANA_PASSWORD = os.getenv("GRAFANA_PASSWORD", "admin")

def create_dashboard(title, panels):
    """Create a Grafana dashboard"""
    url = f"{GRAFANA_URL}/api/dashboards/db"
    
    dashboard = {
        "dashboard": {
            "title": title,
            "panels": panels,
            "timezone": "browser"
        },
        "overwrite": False
    }
    
    response = requests.post(
        url,
        json=dashboard,
        auth=(GRAFANA_USER, GRAFANA_PASSWORD),
        headers={"Content-Type": "application/json"}
    )
    
    return response.json()

def main():
    print("Creating Grafana dashboard...")
    
    panels = [
        {
            "id": 1,
            "title": "Temperature",
            "type": "timeseries",
            "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
            "targets": [
                {
                    "query": 'from(bucket: "iot-data") |> range(start: -1h) |> filter(fn: (r) => r["_measurement"] == "temperature")',
                    "refId": "A"
                }
            ]
        }
    ]
    
    result = create_dashboard("My Custom Dashboard", panels)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()

