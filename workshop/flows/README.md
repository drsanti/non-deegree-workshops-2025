# Node-RED FlowFuse Dashboard Flows

This directory contains pre-configured Node-RED flows for displaying IoT sensor data in FlowFuse Dashboard (Dashboard 2).

## Flow Files

- **flow1.json**: Complete flow with MQTT subscriber, data processing, charts, and gauges

## Quick Start

### Importing Flows into Node-RED

1. Open Node-RED: http://localhost:1880
2. Click the menu (☰) → **Import**
3. Copy and paste the contents of `flow1.json`
4. Click **Import**
5. Click **Deploy** (red button in top right)

### Accessing the Dashboard

After importing and deploying:
- Dashboard URL: http://localhost:1880/ui
- Or: http://localhost:1880/dashboard

## Flow Structure

### flow1.json - Complete Sensor Dashboard

This flow demonstrates how to:
- Subscribe to MQTT sensor data
- Parse JSON payloads
- Extract values for display
- Route data by sensor type
- Display in charts and gauges

#### Flow Components

```
[MQTT In: sensors/+/+]
    ↓
[JSON Parser]
    ↓
[Function: Extract Value]
    ↓
    ├─→ [UI Chart: All Sensors]
    └─→ [Switch: Route by Sensor Type]
            ├─→ [UI Gauge: Temperature]
            ├─→ [UI Gauge: Humidity]
            └─→ [UI Gauge: Switch]
```

## Data Format

The flow expects MQTT messages in this format:

```json
{
  "value": 49.67,
  "unit": "percent",
  "location": "living-room",
  "timestamp": "2025-12-12T12:02:35.380018"
}
```

**Topics:**
- `sensors/temperature/temp-001`
- `sensors/temperature/temp-002`
- `sensors/humidity/hum-001`
- `sensors/humidity/hum-002`
- `sensors/switch/switch-001`
- `sensors/switch/switch-002`

## Node Configuration Details

### 1. MQTT Subscriber Node

- **Name**: "Subscribe to Sensors"
- **Topic**: `sensors/+/+` (matches 3-level topics)
- **QoS**: 0
- **Broker**: EMQX (configured as `emqx`)

**Important**: Ensure the MQTT broker configuration uses:
- **Server**: `emqx` (for Docker containers) or `localhost` (for external access)
- **Port**: `1883`

### 2. JSON Parser Node

- **Action**: Automatically parses JSON strings to objects
- **Property**: `payload`

### 3. Function Node: "Extract Value"

This node extracts the numeric value from the JSON payload:

```javascript
// Extract and format data for dashboard chart
var value = msg.payload.value;
var unit = msg.payload.unit || "";
var location = msg.payload.location || "";

// Parse topic to get sensor info
var topicParts = msg.topic.split('/');
var sensorType = topicParts[1];  // temperature, humidity, switch
var deviceId = topicParts[2];    // temp-001, hum-001, etc.

// Set payload to numeric value (required for chart)
msg.payload = value;

// Set series name for chart legend
msg.series = sensorType + " (" + deviceId + ")";

// Optional: Add metadata
msg.sensorType = sensorType;
msg.deviceId = deviceId;
msg.location = location;
msg.unit = unit;

return msg;
```

**Output**: 
- `msg.payload` = numeric value (e.g., 49.67)
- `msg.sensorType` = "temperature", "humidity", or "switch"
- `msg.series` = series name for chart

### 4. Switch Node

Routes messages based on sensor type:
- **Property**: `sensorType` (from function node)
- **Rules**:
  - `== temperature` → Output 1 (Temperature Gauge)
  - `== humidity` → Output 2 (Humidity Gauge)
  - `== switch` → Output 3 (Switch Gauge)

### 5. UI Chart Node

Displays all sensor values as time series:
- **Chart Type**: Line
- **X-axis**: Time (automatic)
- **Y-axis**: Value (from `msg.payload`)
- **Series**: Uses `msg.series` for legend
- **Remove Older**: 1 hour (keeps last hour of data)

### 6. UI Gauge Nodes

#### Temperature Gauge
- **Type**: Half-circle gauge with needle
- **Min**: 0
- **Max**: 50
- **Units**: Configure as needed (e.g., "°C")
- **Color Segments**:
  - 0-25: Green (#5cd65c)
  - 25-50: Yellow (#ffc800)
  - 50+: Red (#ea5353)

#### Humidity Gauge
- **Type**: Half-circle gauge with needle
- **Min**: 0
- **Max**: 120 (adjust to 100 if needed)
- **Units**: "%" or "percent"
- **Color Segments**:
  - 0-60: Green (#5cd65c)
  - 60-120: Yellow (#ffc800)
  - 120+: Red (#ea5353)

#### Switch Gauge
- **Type**: Half-circle gauge with needle
- **Min**: 0
- **Max**: 1
- **Units**: "on/off" or leave empty
- **Color Segments**:
  - 0: Green (OFF)
  - 0.5: Yellow
  - 1: Red (ON)

## Customizing Gauges

### Changing Gauge Type

In the UI Gauge node configuration:
- **Gauge Type** (`gtype`):
  - `gauge-full`: Full circle
  - `gauge-half`: Half circle (default)
  - `gauge-arc`: Arc style

- **Gauge Style** (`gstyle`):
  - `needle`: Needle pointer (default)
  - `flat`: Flat style

### Adjusting Min/Max Values

1. Double-click the gauge node
2. Set **Min** and **Max** values
3. Example for temperature: Min=0, Max=50
4. Example for humidity: Min=0, Max=100

### Adding Units

1. In gauge configuration, set **Units** field
2. Examples:
   - Temperature: `°C` or `celsius`
   - Humidity: `%` or `percent`
   - Switch: `on/off` or leave empty

### Color Thresholds

Configure color segments in the gauge:
1. Click **Add Segment**
2. Set **From** value (e.g., 0, 25, 50)
3. Choose **Color** (e.g., green, yellow, red)
4. Add multiple segments for different ranges

Example for Temperature:
- Segment 1: From 0, Color Green
- Segment 2: From 25, Color Yellow
- Segment 3: From 50, Color Red

## Displaying Values in Charts

The chart automatically displays values when:
1. `msg.payload` is a number
2. `msg.series` is set (for legend)
3. Messages arrive with timestamps

**Chart Configuration:**
- **Chart Type**: Line (for time series)
- **X-axis**: Time (automatic from message timestamp)
- **Y-axis**: Value (from `msg.payload`)
- **Series**: Multiple series shown as different colored lines

## Troubleshooting

### No Data Appearing in Gauges

1. **Check MQTT Connection**:
   - Verify broker node shows "Connected" (green dot)
   - Check broker server is `emqx` (not an IP address)

2. **Check Topic Subscription**:
   - Subscriber topic should be `sensors/+/+` (3 levels)
   - Verify simulator is publishing to matching topics

3. **Check Data Format**:
   - Ensure JSON contains `value` field
   - Verify function node extracts `msg.payload.value`

4. **Check Gauge Configuration**:
   - Verify `msg.payload` is a number (not object)
   - Check Min/Max values are appropriate
   - Ensure gauge is in correct ui-group

### Gauge Shows Wrong Values

1. **Check Function Node**:
   - Verify it extracts `msg.payload.value`
   - Check `msg.sensorType` is set correctly

2. **Check Switch Node**:
   - Verify routing rules match sensor types
   - Check property is `sensorType`

3. **Check Gauge Range**:
   - Adjust Min/Max if values are outside range
   - Check units are correct

### Chart Not Updating

1. **Check Remove Older Setting**:
   - May be removing data too quickly
   - Adjust `removeOlder` and `removeOlderUnit`

2. **Check Series Names**:
   - Verify `msg.series` is set in function node
   - Check legend is enabled

3. **Check Data Flow**:
   - Verify messages are reaching chart node
   - Check for errors in debug panel

## Modifying the Flow

### Adding More Sensor Types

1. Add new rule in Switch node
2. Add new UI Gauge node
3. Connect switch output to new gauge
4. Configure gauge Min/Max/Units

### Creating Separate Gauges for Each Device

1. Modify Function node to create unique identifier:
   ```javascript
   msg.gaugeId = sensorType + "-" + deviceId;
   ```

2. Update Switch node with more rules:
   - `== temperature-temp-001`
   - `== temperature-temp-002`
   - etc.

3. Add separate gauge for each device

### Changing Update Frequency

The simulator publishes every 5 seconds. To change:
- Edit `simulator/iot_simulator.py`
- Change `simulator.run(interval=5)` to desired interval

## Best Practices

1. **Organize Dashboard**:
   - Use ui-groups to organize related widgets
   - Use ui-pages for different views
   - Set appropriate widths/heights

2. **Performance**:
   - Limit chart data points (use `removeOlder`)
   - Use appropriate update intervals
   - Don't create too many widgets

3. **User Experience**:
   - Use clear labels and units
   - Set appropriate color thresholds
   - Make gauges responsive (appropriate sizes)

## Related Documentation

- Workshop 05: Node-RED Integration (`workshop/docs/workshop-05-node-red-integration.md`)
- Workshop 06: Data Visualization (`workshop/docs/workshop-06-data-visualization.md`)
- FlowFuse Dashboard Documentation: https://dashboard.flowfuse.com

## Support

For issues:
1. Check Node-RED debug panel for errors
2. Verify all services are running: `docker-compose ps`
3. Check MQTT broker connection
4. Review flow node configurations

