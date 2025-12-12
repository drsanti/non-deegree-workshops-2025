# Workshop 06: Data Visualization with Grafana and FlowFuse Dashboard

## Objectives

By the end of this workshop, you will be able to:
- Create Grafana dashboards programmatically
- Write Flux queries for InfluxDB
- Add panels and configure visualizations
- Use FlowFuse Dashboard advanced features
- Create custom dashboard templates
- Set up alerts and notifications

## Prerequisites

- Completed Workshop 05
- Grafana service running
- Node-RED with FlowFuse Dashboard running
- Understanding of InfluxDB queries

## Part 1: Grafana Dashboard Creation via API

### Grafana API Authentication

Grafana API uses API keys or basic auth. Create an API key:
1. Go to Grafana: http://localhost:3000
2. Configuration → API Keys
3. Create new key with Admin role

### Exercise: Create Dashboard via API

Create `workshop/code/workshop-06/grafana_dashboard_api.py`:

```python
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

# Create a simple dashboard
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
```

## Part 2: Adding Panels Programmatically

### Exercise: Panel Management

Create `workshop/code/workshop-06/grafana_panels.py`:

```python
import requests
import json

GRAFANA_URL = "http://localhost:3000"
AUTH = ("admin", "admin")

def add_panel_to_dashboard(dashboard_uid, panel_config):
    """Add a panel to existing dashboard"""
    # Get dashboard
    url = f"{GRAFANA_URL}/api/dashboards/uid/{dashboard_uid}"
    response = requests.get(url, auth=AUTH)
    dashboard = response.json()["dashboard"]
    
    # Add panel
    dashboard["panels"].append(panel_config)
    
    # Update dashboard
    update_url = f"{GRAFANA_URL}/api/dashboards/db"
    payload = {"dashboard": dashboard, "overwrite": True}
    response = requests.post(update_url, json=payload, auth=AUTH)
    return response.json()

# Panel configurations
temperature_panel = {
    "id": 1,
    "title": "Temperature Over Time",
    "type": "timeseries",
    "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
    "targets": [{
        "query": 'from(bucket: "iot-data") |> range(start: -1h) |> filter(fn: (r) => r["_measurement"] == "temperature")',
        "refId": "A"
    }]
}

humidity_panel = {
    "id": 2,
    "title": "Humidity Gauge",
    "type": "gauge",
    "gridPos": {"h": 6, "w": 6, "x": 12, "y": 0},
    "targets": [{
        "query": 'from(bucket: "iot-data") |> range(start: -5m) |> filter(fn: (r) => r["_measurement"] == "humidity") |> last()',
        "refId": "A"
    }]
}
```

## Part 3: Writing Flux Queries

### Exercise: Advanced Flux Queries

Create `workshop/code/workshop-06/grafana_queries.py`:

```python
"""
Examples of Flux queries for Grafana
"""

# Query 1: Last hour average
query1 = '''
from(bucket: "iot-data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> yield(name: "mean")
'''

# Query 2: Multiple measurements
query2 = '''
union(
  tables: [
    from(bucket: "iot-data")
      |> range(start: -1h)
      |> filter(fn: (r) => r["_measurement"] == "temperature"),
    from(bucket: "iot-data")
      |> range(start: -1h)
      |> filter(fn: (r) => r["_measurement"] == "humidity")
  ]
)
  |> aggregateWindow(every: 1m, fn: mean)
'''

# Query 3: Group by device
query3 = '''
from(bucket: "iot-data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> group(columns: ["device_id"])
  |> aggregateWindow(every: 5m, fn: mean)
'''

# Query 4: Latest value per device
query4 = '''
from(bucket: "iot-data")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> group(columns: ["device_id"])
  |> last()
'''

print("Flux Query Examples:")
print("\n1. Hourly Average:")
print(query1)
print("\n2. Multiple Measurements:")
print(query2)
print("\n3. Group by Device:")
print(query3)
print("\n4. Latest Values:")
print(query4)
```

## Part 4: Grafana Visualization Examples

### Exercise: Complete Visualization

Create `workshop/code/workshop-06/grafana_visualization.py`:

```python
import requests
import json

GRAFANA_URL = "http://localhost:3000"
AUTH = ("admin", "admin")

def create_complete_dashboard():
    """Create a complete dashboard with multiple visualizations"""
    
    dashboard = {
        "dashboard": {
            "title": "IoT Sensor Dashboard",
            "tags": ["iot", "sensors"],
            "timezone": "browser",
            "panels": [
                {
                    "id": 1,
                    "title": "Temperature Time Series",
                    "type": "timeseries",
                    "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
                    "targets": [{
                        "query": 'from(bucket: "iot-data") |> range(start: -1h) |> filter(fn: (r) => r["_measurement"] == "temperature")',
                        "refId": "A"
                    }]
                },
                {
                    "id": 2,
                    "title": "Current Temperature",
                    "type": "stat",
                    "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
                    "targets": [{
                        "query": 'from(bucket: "iot-data") |> range(start: -5m) |> filter(fn: (r) => r["_measurement"] == "temperature") |> last()',
                        "refId": "A"
                    }],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "celsius",
                            "color": {"mode": "thresholds"}
                        }
                    }
                },
                {
                    "id": 3,
                    "title": "Humidity Gauge",
                    "type": "gauge",
                    "gridPos": {"h": 4, "w": 6, "x": 18, "y": 0},
                    "targets": [{
                        "query": 'from(bucket: "iot-data") |> range(start: -5m) |> filter(fn: (r) => r["_measurement"] == "humidity") |> last()',
                        "refId": "A"
                    }]
                }
            ]
        },
        "overwrite": False
    }
    
    response = requests.post(
        f"{GRAFANA_URL}/api/dashboards/db",
        json=dashboard,
        auth=AUTH
    )
    
    return response.json()

result = create_complete_dashboard()
print(json.dumps(result, indent=2))
```

## Part 5: FlowFuse Dashboard Advanced Features

### Exercise: Custom Templates

Create `workshop/code/workshop-06/node_red_dashboard.py`:

```python
"""
Send data to Node-RED Dashboard
"""

import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime

MQTT_BROKER = "localhost"
MQTT_PORT = 1883

def send_dashboard_data():
    """Send formatted data for dashboard"""
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    
    for i in range(20):
        data = {
            "temperature": 20 + i * 0.3,
            "humidity": 50 + i * 0.5,
            "pressure": 1013 + i,
            "timestamp": datetime.now().isoformat()
        }
        
        # Send to different topics for different widgets
        client.publish("dashboard/temperature", json.dumps({"value": data["temperature"]}))
        client.publish("dashboard/humidity", json.dumps({"value": data["humidity"]}))
        client.publish("dashboard/pressure", json.dumps({"value": data["pressure"]}))
        
        print(f"Sent: {data}")
        time.sleep(1)
    
    client.disconnect()

send_dashboard_data()
```

## Part 6: Alerts and Notifications

### Setting Up Grafana Alerts

1. Go to Grafana dashboard
2. Edit panel
3. Go to "Alert" tab
4. Create alert rule:
   - Condition: `WHEN avg() OF query(A, 5m, now) IS BELOW 20`
   - Evaluate every: 1m
   - For: 5m

### Exercise: Alert Configuration

```python
def create_alert_rule(dashboard_uid, panel_id):
    """Create alert rule for a panel"""
    alert_rule = {
        "name": "Temperature Alert",
        "condition": "avg",
        "data": [
            {
                "refId": "A",
                "queryType": "",
                "relativeTimeRange": {"from": 300, "to": 0},
                "datasourceUid": "influxdb-uid",
                "model": {
                    "query": 'from(bucket: "iot-data") |> range(start: -5m) |> filter(fn: (r) => r["_measurement"] == "temperature")'
                }
            }
        ],
        "intervalSeconds": 60,
        "maxDataPoints": 100,
        "noDataState": "NoData",
        "execErrState": "Alerting",
        "for": "5m",
        "annotations": {
            "description": "Temperature is below threshold"
        }
    }
    
    # Implementation depends on Grafana API version
    return alert_rule
```

## Part 7: Practical Exercise

### Task: Complete Visualization System

Create a system with:
1. Multiple Grafana dashboards
2. Real-time data visualization
3. Custom panels and queries
4. Alerts for thresholds
5. Node-RED dashboard integration
6. Custom templates

## Troubleshooting

### API Authentication Errors
- Verify credentials
- Check API key permissions
- Use basic auth for testing

### Query Errors
- Test queries in Grafana UI first
- Check bucket and measurement names
- Verify time ranges

### Dashboard Not Updating
- Check data source connection
- Verify queries return data
- Refresh dashboard

## Next Steps

- Workshop 07: IoT Simulator - Generate test data
- Workshop 08: Home Automation - Complete system

## Summary

In this workshop, you:
- ✅ Created Grafana dashboards via API
- ✅ Added panels programmatically
- ✅ Wrote advanced Flux queries
- ✅ Created custom visualizations
- ✅ Set up alerts
- ✅ Used FlowFuse Dashboard features

You can now create comprehensive data visualizations!

