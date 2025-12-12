# Workshop 05: Node-RED Integration

## Objectives

By the end of this workshop, you will be able to:
- Understand Node-RED flow programming
- Access Node-RED via HTTP API
- Integrate Python with Node-RED flows
- Use FlowFuse Dashboard nodes
- Create interactive dashboards

## Prerequisites

- Completed Workshop 04
- Node-RED service running
- FlowFuse Dashboard installed

## Part 1: Understanding Node-RED

### What is Node-RED?

Node-RED is a flow-based programming tool for connecting hardware devices, APIs, and online services. It provides:
- Visual flow editor
- Pre-built nodes for common tasks
- HTTP API for integration
- Dashboard for visualization

### Accessing Node-RED

1. Open Node-RED: http://localhost:1880
2. The editor shows flows on the left, nodes in the middle, and configuration on the right

## Part 2: Node-RED HTTP API

### API Endpoints

- `GET /flows` - Get all flows
- `POST /flow` - Deploy a flow
- `POST /inject/:id` - Inject message into a node
- `GET /nodes` - List available nodes

### Exercise: Python to Node-RED Integration

Create `workshop/code/workshop-05/node_red_integration.py`:

```python
import requests
import json
from datetime import datetime

NODE_RED_URL = "http://localhost:1880"

def inject_message(node_id, payload):
    """Inject message into a Node-RED node"""
    url = f"{NODE_RED_URL}/inject/{node_id}"
    response = requests.post(url, json=payload)
    return response.json()

def get_flows():
    """Get all flows"""
    url = f"{NODE_RED_URL}/flows"
    response = requests.get(url)
    return response.json()

# Example: Inject temperature data
message = {
    "temperature": 25.5,
    "humidity": 60,
    "timestamp": datetime.now().isoformat()
}

# Note: Replace 'inject-node-id' with actual node ID from Node-RED
# result = inject_message("inject-node-id", message)
# print(f"Injected: {result}")

# Get flows
flows = get_flows()
print("Available flows:")
print(json.dumps(flows, indent=2))
```

## Part 3: FlowFuse Dashboard Basics

### Dashboard Nodes

- **ui-base**: Base dashboard configuration
- **ui-page**: Dashboard page
- **ui-group**: Group of widgets
- **ui-chart**: Data visualization
- **ui-gauge**: Gauge display
- **ui-text**: Text display
- **ui-button**: Button control
- **ui-switch**: Toggle switch
- **ui-slider**: Slider control
- **ui-template**: Custom HTML/Vue component

### Exercise: Creating a Dashboard

1. Open Node-RED: http://localhost:1880
2. Drag a **ui-base** node to the canvas
3. Configure it:
   - Name: "IoT Dashboard"
   - Path: "/dashboard"
4. Drag a **ui-page** node
5. Connect it to ui-base
6. Add a **ui-chart** node
7. Connect an inject node to send test data

### Exercise: Python to Dashboard

Create `workshop/code/workshop-05/dashboard_basics.py`:

```python
import requests
import json
import time
from datetime import datetime

NODE_RED_URL = "http://localhost:1880"
MQTT_BROKER = "localhost"
MQTT_PORT = 1883

def send_to_dashboard_via_mqtt(topic, data):
    """Send data to dashboard via MQTT (Node-RED subscribes)"""
    import paho.mqtt.client as mqtt
    
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.publish(topic, json.dumps(data))
    client.disconnect()

# Send sensor data that Node-RED will display
for i in range(10):
    data = {
        "temperature": 20 + i * 0.5,
        "humidity": 50 + i,
        "timestamp": datetime.now().isoformat()
    }
    send_to_dashboard_via_mqtt("sensors/dashboard", data)
    print(f"Sent: {data}")
    time.sleep(1)
```

## Part 4: Node-RED Flow Examples

### Example 1: MQTT to Dashboard

Create a flow:
1. **mqtt in** node → Subscribe to "sensors/+"
2. **ui-chart** node → Display data
3. Connect mqtt in to ui-chart

### Example 2: HTTP Endpoint

1. **http in** node → GET /api/data
2. **function** node → Process request
3. **http response** node → Return data

### Example 3: Database Integration

1. **inject** node → Trigger
2. **influxdb** node → Query data
3. **ui-chart** node → Display results

## Part 5: Advanced Dashboard Features

### Custom Templates

Use **ui-template** node to create custom widgets:

```html
<div style="padding: 20px;">
    <h3>{{msg.payload.device}}</h3>
    <p>Temperature: {{msg.payload.temperature}}°C</p>
    <p>Humidity: {{msg.payload.humidity}}%</p>
</div>
```

### Interactive Controls

1. Add **ui-button** node
2. Configure button action
3. Connect to function node to handle clicks
4. Update dashboard or send commands

## Part 6: Practical Exercise

### Task: Complete Dashboard System

Create a system that:
1. Receives MQTT sensor data
2. Displays data in multiple chart types
3. Allows control via buttons/switches
4. Shows device status
5. Updates in real-time

**Node-RED Flow:**
- MQTT input → Parse JSON → Multiple charts
- Button → Function → MQTT publish
- Inject → Query InfluxDB → Display

**Python Script:**
- Publish sensor data
- Send control commands
- Query via HTTP API

## Part 7: Dashboard Best Practices

### Organization
- Use pages for different views
- Group related widgets
- Use consistent naming

### Performance
- Limit data points in charts
- Use appropriate update intervals
- Optimize queries

### User Experience
- Clear labels and units
- Responsive layout
- Color coding for status

## Troubleshooting

### Dashboard Not Loading
- Check ui-base is configured
- Verify path is correct
- Check browser console for errors

### Data Not Updating
- Verify MQTT connection
- Check node connections
- Verify data format matches

### Node Not Found
- Install required nodes via Palette Manager
- Check node is properly configured
- Restart Node-RED if needed

## Next Steps

- Workshop 06: Data Visualization - Advanced Grafana and Dashboard features
- Workshop 08: Home Automation - Build complete automation flows

## Summary

In this workshop, you:
- ✅ Learned Node-RED basics
- ✅ Integrated Python with Node-RED
- ✅ Created FlowFuse Dashboard
- ✅ Used dashboard nodes
- ✅ Built interactive visualizations

You can now create visual dashboards with Node-RED!

