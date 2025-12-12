# System Architecture Overview

This document provides a comprehensive overview of the IoT Home Automation Learning Platform architecture, explaining how all Docker services and Python code work together.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Docker Services](#docker-services)
4. [Network Architecture](#network-architecture)
5. [Data Flow](#data-flow)
6. [Component Interactions](#component-interactions)
7. [Python Integration](#python-integration)

## System Overview

The platform is a complete IoT ecosystem designed for teaching Python programming with real-world IoT services. It consists of:

- **7 Docker Services**: Running in isolated containers
- **Python Code**: Student scripts that interact with services
- **Workshop Materials**: 10 progressive learning modules

### Key Components

| Component | Type | Purpose |
|-----------|------|---------|
| EMQX | MQTT Broker | Message routing for IoT devices |
| InfluxDB | Database | Time-series data storage |
| Node-RED | Flow Engine | Visual automation and dashboards |
| Flask API | REST Service | HTTP API for Python interactions |
| Grafana | Visualization | Advanced data visualization |
| Nginx | Reverse Proxy | Unified access point |
| IoT Simulator | Data Generator | Simulates IoT devices |

## Architecture Diagram

```mermaid
graph TB
    subgraph "Host Machine"
        Python["Python Scripts - Student Code"]
        Browser["Web Browser - User Interface"]
    end
    
    subgraph "Docker Network: iot-network"
        subgraph "Data Layer"
            InfluxDB[("InfluxDB - Port 8086 - Time-Series DB")]
        end
        
        subgraph "Messaging Layer"
            EMQX["EMQX MQTT Broker - Port 1883 - Message Routing"]
        end
        
        subgraph "Application Layer"
            NodeRED["Node-RED - Port 1880 - FlowFuse Dashboard"]
            FlaskAPI["Flask API - Port 5000 - REST Endpoints"]
            Simulator["IoT Simulator - Data Generator"]
        end
        
        subgraph "Visualization Layer"
            Grafana["Grafana - Port 3000 - Dashboards"]
        end
        
        subgraph "Access Layer"
            Nginx["Nginx - Port 8888 - Reverse Proxy"]
        end
    end
    
    Python -->|MQTT:1883| EMQX
    Python -->|HTTP:5000| FlaskAPI
    Python -->|HTTP:8086| InfluxDB
    Python -->|HTTP:3000| Grafana
    
    Browser -->|HTTP:8888| Nginx
    Browser -->|HTTP:1880| NodeRED
    Browser -->|HTTP:3000| Grafana
    Browser -->|HTTP:18083| EMQX
    
    Simulator -->|MQTT Publish| EMQX
    Simulator -->|Write Data| InfluxDB
    
    NodeRED -->|MQTT Subscribe| EMQX
    NodeRED -->|Read/Write| InfluxDB
    
    FlaskAPI -->|MQTT Publish/Subscribe| EMQX
    FlaskAPI -->|Read/Write| InfluxDB
    FlaskAPI -->|API Calls| Grafana
    
    Grafana -->|Query Data| InfluxDB
    
    Nginx -->|Proxy| NodeRED
    Nginx -->|Proxy| FlaskAPI
    Nginx -->|Proxy| Grafana
```

## Docker Services

### Service Details

```mermaid
graph LR
    subgraph "Container Network"
        EMQX["EMQX - emqx:1883"]
        InfluxDB["InfluxDB - influxdb:8086"]
        NodeRED["Node-RED - node-red:1880"]
        FlaskAPI["Flask API - flask-api:5000"]
        Grafana["Grafana - grafana:3000"]
        Simulator["Simulator - simulator"]
        Nginx["Nginx - nginx:80"]
    end
    
    EMQX -.->|MQTT| NodeRED
    EMQX -.->|MQTT| FlaskAPI
    EMQX -.->|MQTT| Simulator
    InfluxDB -.->|HTTP| NodeRED
    InfluxDB -.->|HTTP| FlaskAPI
    InfluxDB -.->|HTTP| Simulator
    InfluxDB -.->|HTTP| Grafana
    Grafana -.->|HTTP| FlaskAPI
    Nginx -.->|HTTP| NodeRED
    Nginx -.->|HTTP| FlaskAPI
    Nginx -.->|HTTP| Grafana
```

### Service Ports and Access

| Service | Container Name | Internal Port | External Port | Access Method |
|---------|---------------|--------------|---------------|---------------|
| **EMQX** | `iot-emqx` | 1883 | 1883 | MQTT Protocol |
| **EMQX** | `iot-emqx` | 18083 | 18083 | HTTP Dashboard |
| **InfluxDB** | `iot-influxdb` | 8086 | 8086 | HTTP API |
| **Node-RED** | `iot-node-red` | 1880 | 1880 | HTTP UI |
| **Flask API** | `iot-flask-api` | 5000 | 5000 | HTTP REST |
| **Grafana** | `iot-grafana` | 3000 | 3000 | HTTP UI |
| **Nginx** | `iot-nginx` | 80 | 8888 | HTTP Proxy |
| **Simulator** | `iot-simulator` | - | - | Internal Only |

### Service Dependencies

```mermaid
graph TD
    Start[Start Services] --> EMQX[EMQX MQTT Broker]
    Start --> InfluxDB[InfluxDB]
    
    EMQX --> NodeRED[Node-RED]
    InfluxDB --> NodeRED
    InfluxDB --> Grafana[Grafana]
    
    EMQX --> FlaskAPI[Flask API]
    InfluxDB --> FlaskAPI
    Grafana --> FlaskAPI
    
    EMQX --> Simulator[IoT Simulator]
    InfluxDB --> Simulator
    
    NodeRED --> Nginx[Nginx]
    FlaskAPI --> Nginx
    Grafana --> Nginx
```

**Dependency Order:**
1. **Base Services**: EMQX, InfluxDB (no dependencies)
2. **Application Services**: Node-RED, Flask API, Grafana (depend on base)
3. **Data Generator**: Simulator (depends on EMQX, InfluxDB)
4. **Access Layer**: Nginx (depends on application services)

## Network Architecture

### Docker Network Configuration

All services run on a single Docker bridge network: `iot-network`

```mermaid
graph TB
    subgraph "Docker Bridge Network: iot-network"
        EMQX["emqx - 172.x.x.2"]
        InfluxDB["influxdb - 172.x.x.3"]
        NodeRED["node-red - 172.x.x.4"]
        FlaskAPI["flask-api - 172.x.x.5"]
        Grafana["grafana - 172.x.x.6"]
        Simulator["simulator - 172.x.x.7"]
        Nginx["nginx - 172.x.x.8"]
    end
    
    Host["Host Machine - localhost"]
    
    Host -->|Port Mapping| EMQX
    Host -->|Port Mapping| InfluxDB
    Host -->|Port Mapping| NodeRED
    Host -->|Port Mapping| FlaskAPI
    Host -->|Port Mapping| Grafana
    Host -->|Port Mapping| Nginx
    
    EMQX <-->|Container Name Resolution| NodeRED
    EMQX <-->|Container Name Resolution| FlaskAPI
    EMQX <-->|Container Name Resolution| Simulator
    InfluxDB <-->|Container Name Resolution| NodeRED
    InfluxDB <-->|Container Name Resolution| FlaskAPI
    InfluxDB <-->|Container Name Resolution| Grafana
    InfluxDB <-->|Container Name Resolution| Simulator
```

### Connection Methods

**From Host Machine (Python Scripts):**
- Use `localhost` or `127.0.0.1`
- Access via mapped ports (1883, 5000, 8086, etc.)

**From Docker Containers:**
- Use container names (e.g., `emqx`, `influxdb`)
- Access via internal ports (1883, 8086, etc.)
- DNS resolution handled by Docker

## Data Flow

### Complete Data Flow Diagram

```mermaid
sequenceDiagram
    participant Sim as IoT Simulator
    participant MQTT as EMQX Broker
    participant NR as Node-RED
    participant DB as InfluxDB
    participant API as Flask API
    participant Graf as Grafana
    participant Py as Python Scripts
    participant User as User/Browser
    
    Note over Sim: Generates sensor data every 5s
    Sim->>MQTT: Publish JSON data<br/>Topic: sensors/+/+
    Sim->>DB: Write time-series data
    
    MQTT->>NR: Route messages to subscribers
    NR->>NR: Parse JSON, extract values
    NR->>NR: Display in Dashboard (gauges/charts)
    
    Py->>MQTT: Subscribe to topics
    MQTT->>Py: Receive sensor data
    
    Py->>API: HTTP POST /mqtt/publish
    API->>MQTT: Publish message
    
    Py->>API: HTTP POST /database/write
    API->>DB: Write data
    
    Py->>API: HTTP POST /database/query
    API->>DB: Query data
    API->>Py: Return results
    
    User->>Graf: View dashboards
    Graf->>DB: Query time-series data
    DB->>Graf: Return data points
    Graf->>User: Display charts
    
    User->>NR: View FlowFuse Dashboard
    NR->>User: Display real-time gauges
```

### Data Flow Paths

#### Path 1: Simulator → MQTT → Node-RED Dashboard

```
IoT Simulator
  ↓ (Publish MQTT)
EMQX Broker (sensors/temperature/temp-001)
  ↓ (Route to subscribers)
Node-RED MQTT Subscriber
  ↓ (Parse JSON)
Function Node (Extract value)
  ↓ (Route by type)
UI Gauge/Chart
  ↓ (Display)
User Browser (http://localhost:1880/ui)
```

#### Path 2: Python Script → Flask API → InfluxDB

```
Python Script
  ↓ (HTTP POST)
Flask API (/database/write)
  ↓ (InfluxDB Client)
InfluxDB (Store data point)
  ↓ (Query)
Grafana Dashboard
  ↓ (Display)
User Browser (http://localhost:3000)
```

#### Path 3: Python Script → MQTT → Multiple Subscribers

```
Python Script
  ↓ (Publish MQTT)
EMQX Broker
  ↓ (Broadcast)
  ├─→ Node-RED (Subscriber)
  ├─→ Flask API (Subscriber)
  └─→ Other Python Scripts (Subscribers)
```

## Component Interactions

### Interaction Matrix

```mermaid
graph TB
    subgraph "Services"
        EMQX[EMQX]
        InfluxDB[InfluxDB]
        NodeRED[Node-RED]
        FlaskAPI[Flask API]
        Grafana[Grafana]
        Simulator[Simulator]
    end
    
    EMQX -->|MQTT Messages| NodeRED
    EMQX -->|MQTT Messages| FlaskAPI
    EMQX -->|MQTT Messages| Simulator
    Simulator -->|MQTT Publish| EMQX
    
    InfluxDB -->|Query Results| NodeRED
    InfluxDB -->|Query Results| FlaskAPI
    InfluxDB -->|Query Results| Grafana
    Simulator -->|Write Data| InfluxDB
    FlaskAPI -->|Write/Query| InfluxDB
    
    FlaskAPI -->|API Calls| Grafana
    NodeRED -->|Read Data| InfluxDB
```

### Detailed Interactions

#### 1. MQTT Communication

**Protocol**: MQTT (Message Queuing Telemetry Transport)
**Port**: 1883 (internal), 1883 (external)

**Publishers:**
- IoT Simulator: Publishes sensor data
- Python Scripts: Publish commands/data
- Flask API: Publishes via `/mqtt/publish` endpoint
- Node-RED: Can publish via flows

**Subscribers:**
- Node-RED: Subscribes to `sensors/+/+`
- Python Scripts: Subscribe to topics
- Flask API: Can subscribe for processing

#### 2. Database Operations

**Protocol**: HTTP REST API
**Port**: 8086

**Writers:**
- IoT Simulator: Writes sensor readings
- Flask API: Writes via `/database/write` endpoint
- Python Scripts: Write directly using `influxdb-client`

**Readers:**
- Grafana: Queries for visualization
- Flask API: Queries via `/database/query` endpoint
- Python Scripts: Query directly
- Node-RED: Can query via InfluxDB nodes

#### 3. REST API Communication

**Protocol**: HTTP REST
**Port**: 5000

**Endpoints:**
- `/mqtt/publish` - Publish MQTT messages
- `/mqtt/subscribe` - Subscribe to topics
- `/database/write` - Write to InfluxDB
- `/database/query` - Query InfluxDB
- `/devices/*` - Device management

**Clients:**
- Python Scripts: Use `requests` library
- Web Browsers: Direct HTTP calls
- Other Services: Internal API calls

## Python Integration

### How Python Code Interacts with Services

```mermaid
graph LR
    subgraph "Python Environment"
        PyScript["Python Scripts - workshop/code/"]
        PyLibs["Python Libraries - paho-mqtt, influxdb-client, requests"]
    end
    
    subgraph "Docker Services"
        EMQX[EMQX]
        InfluxDB[InfluxDB]
        FlaskAPI[Flask API]
        Grafana[Grafana]
    end
    
    PyScript -->|Uses| PyLibs
    PyLibs -->|MQTT Protocol| EMQX
    PyLibs -->|HTTP API| InfluxDB
    PyLibs -->|HTTP REST| FlaskAPI
    PyLibs -->|HTTP API| Grafana
```

### Python Library Usage

| Library | Service | Purpose | Example |
|---------|---------|---------|---------|
| `paho-mqtt` | EMQX | MQTT communication | Publish/subscribe messages |
| `influxdb-client` | InfluxDB | Database operations | Write/query time-series data |
| `requests` | Flask API, Grafana | HTTP communication | REST API calls, Grafana API |
| `python-dotenv` | All | Configuration | Load environment variables |

### Connection Patterns

#### Pattern 1: Direct Service Connection

```python
# Direct connection to services
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient

# Connect to MQTT (from host machine)
mqtt_client = mqtt.Client()
mqtt_client.connect("localhost", 1883, 60)  # Use localhost

# Connect to InfluxDB (from host machine)
influx_client = InfluxDBClient(
    url="http://localhost:8086",  # Use localhost
    token="my-token",
    org="iot-org"
)
```

#### Pattern 2: Via REST API

```python
# Connect via Flask API
import requests

# Publish MQTT via API
response = requests.post(
    "http://localhost:5000/mqtt/publish",
    json={"topic": "sensors/data", "message": {...}}
)

# Query database via API
response = requests.post(
    "http://localhost:5000/database/query",
    json={"query": "from(bucket: \"iot-data\")..."}
)
```

## Service Startup Sequence

```mermaid
sequenceDiagram
    participant DC as Docker Compose
    participant EMQX as EMQX
    participant InfluxDB as InfluxDB
    participant NodeRED as Node-RED
    participant FlaskAPI as Flask API
    participant Grafana as Grafana
    participant Simulator as Simulator
    participant Nginx as Nginx
    
    DC->>EMQX: Start (no dependencies)
    DC->>InfluxDB: Start (no dependencies)
    
    EMQX-->>DC: Ready
    InfluxDB-->>DC: Ready
    
    DC->>NodeRED: Start (depends on EMQX, InfluxDB)
    DC->>Grafana: Start (depends on InfluxDB)
    DC->>FlaskAPI: Start (depends on EMQX, InfluxDB, Grafana)
    
    NodeRED-->>DC: Ready
    Grafana-->>DC: Ready
    FlaskAPI-->>DC: Ready
    
    DC->>Simulator: Start (depends on EMQX, InfluxDB)
    Simulator-->>DC: Ready
    
    DC->>Nginx: Start (depends on NodeRED, FlaskAPI, Grafana)
    Nginx-->>DC: Ready
    
    Note over DC: All services running
```

## Data Persistence

### Volumes

```mermaid
graph TB
    subgraph "Docker Volumes"
        InfluxVol["influxdb-data - Time-series data"]
        InfluxConfig["influxdb-config - Configuration"]
        EMQXData["emqx-data - MQTT state"]
        EMQXLog["emqx-log - Logs"]
        NodeREDVol["node-red-data - Flows & settings"]
        GrafanaVol["grafana-data - Dashboards & config"]
    end
    
    InfluxDB -->|Mounts| InfluxVol
    InfluxDB -->|Mounts| InfluxConfig
    EMQX -->|Mounts| EMQXData
    EMQX -->|Mounts| EMQXLog
    NodeRED -->|Mounts| NodeREDVol
    Grafana -->|Mounts| GrafanaVol
```

**Volume Locations:**
- Data persists across container restarts
- Volumes managed by Docker
- Can be backed up/restored

## Security Considerations

### Network Isolation

- All services on isolated Docker network
- Only necessary ports exposed to host
- Internal communication via container names

### Authentication

- **InfluxDB**: Token-based authentication
- **Grafana**: Username/password (admin/admin)
- **EMQX**: Default credentials (admin/public)
- **Flask API**: No authentication (development mode)

**Note**: For production, implement proper authentication!

## Performance Characteristics

### Resource Usage

- **Lightweight Services**: EMQX, Nginx
- **Medium Services**: Node-RED, Flask API
- **Heavy Services**: InfluxDB, Grafana

### Scalability

- Services can be scaled horizontally
- Load balancing via Nginx
- Database sharding possible
- MQTT clustering supported

## Related Documentation

- [Data Flow Details](data-flow.md) - Detailed data flow explanations
- [Component Details](component-details.md) - Individual component documentation
- [Workshop 01: Introduction](../workshop-01-introduction.md) - Getting started guide

