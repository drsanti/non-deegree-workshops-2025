# IoT Home Automation Learning Platform

A comprehensive Docker-based IoT and Home Automation learning environment for teaching Python programming with real-world IoT services.

## Overview

This platform provides a complete IoT ecosystem including:
- **Node-RED** with FlowFuse Dashboard for visual flow programming
- **InfluxDB** for time-series data storage
- **EMQX** MQTT broker for IoT messaging
- **Flask** REST API for Python interactions
- **Grafana** for data visualization
- **Nginx** as reverse proxy
- **IoT Simulator** for generating test data

## Features

- 🐳 Complete Docker Compose setup
- 📚 10 Progressive Workshops with documentation and code
- 🐍 Python examples for all services
- 📊 Pre-configured Grafana dashboards
- 🎨 FlowFuse Dashboard integration
- 🔧 Easy setup scripts for Python environment

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Python 3.8 or higher
- Git (optional)

### 1. Start Docker Services

```bash
cd docker
docker-compose up -d
```

This will start all services:
- InfluxDB: http://localhost:8086
- EMQX: http://localhost:1883 (MQTT), http://localhost:18083 (Dashboard)
- Node-RED: http://localhost:1880
- Flask API: http://localhost:5000
- Grafana: http://localhost:3000 (admin/admin)
- Nginx: http://localhost:8888 (routes to all services)

### 2. Setup Python Environment

**Windows:**
```bash
setup_python_env.bat
```

**Linux/Mac:**
```bash
chmod +x setup_python_env.sh
./setup_python_env.sh
```

Or manually:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your configuration:
```bash
cp .env.example .env
```

### 4. Verify Setup

```bash
python workshop/code/workshop-01/test_environment.py
```

## Documentation

This project includes comprehensive documentation organized into several categories:

### Workshop Documentation

Progressive learning modules with step-by-step instructions and Python code examples:

- **[Workshop 01: Introduction](workshop/docs/workshop-01-introduction.md)** - Python environment setup, Docker services overview, and your first Python script
- **[Workshop 02: MQTT Basics](workshop/docs/workshop-02-mqtt-basics.md)** - Publishing and subscribing to MQTT topics, protocol fundamentals, and Python MQTT client
- **[Workshop 03: Database Operations](workshop/docs/workshop-03-database-operations.md)** - InfluxDB write operations, Flux query language, and data visualization in Grafana
- **[Workshop 04: REST API](workshop/docs/workshop-04-rest-api.md)** - Flask API integration, HTTP requests with Python, and API endpoints
- **[Workshop 05: Node-RED Integration](workshop/docs/workshop-05-node-red-integration.md)** - Flow-based programming, FlowFuse Dashboard basics, and Python ↔ Node-RED communication
- **[Workshop 06: Data Visualization](workshop/docs/workshop-06-data-visualization.md)** - Grafana dashboards, advanced Flux queries, and FlowFuse Dashboard features
- **[Workshop 07: IoT Simulator](workshop/docs/workshop-07-iot-simulator.md)** - Device simulation, real-time data generation, and visualization
- **[Workshop 08: Home Automation](workshop/docs/workshop-08-home-automation.md)** - Automation rules, sensor-actuator integration, and monitoring dashboards
- **[Workshop 09: Advanced Topics](workshop/docs/workshop-09-advanced-topics.md)** - Security best practices, performance optimization, and scaling techniques
- **[Workshop 10: Capstone Project](workshop/docs/workshop-10-capstone-project.md)** - Complete system implementation, integration of all concepts, and project presentation

### Architecture Documentation

Comprehensive system architecture documentation with diagrams and detailed explanations:

- **[Architecture Index](workshop/docs/Architecture/architecture-index.md)** - Navigation guide and overview of all architecture documentation
- **[Architecture Overview](workshop/docs/Architecture/architecture-overview.md)** - High-level system architecture, component relationships, and network topology
- **[Data Flow](workshop/docs/Architecture/data-flow.md)** - How data moves through the system from sensors to visualization
- **[Component Details](workshop/docs/Architecture/component-details.md)** - Detailed documentation of each Docker service and Python component

### Docker Documentation

Step-by-step Docker teaching documentation covering fundamentals to advanced topics:

- **[Chapter 1: Docker Fundamentals](docker/docs/01-docker-fundamentals.md)** - What is Docker, core concepts, installation, and basic commands
- **[Chapter 2: Project Architecture and Design](docker/docs/02-project-architecture.md)** - Why Docker for this project, system architecture, and design decisions
- **[Chapter 3: Dockerfile Deep Dive](docker/docs/03-dockerfile-implementation.md)** - Dockerfile syntax, best practices, and line-by-line analysis of project Dockerfiles
- **[Chapter 4: Docker Compose Configuration](docker/docs/04-docker-compose-setup.md)** - Docker Compose fundamentals, service configuration, and complete walkthrough
- **[Chapter 5: Building and Running](docker/docs/05-building-and-running.md)** - Building images, running containers, debugging techniques, and management
- **[Chapter 6: Publishing to GitHub Container Registry](docker/docs/06-publishing-ghcr.md)** - Setting up GHCR, authenticating, tagging, and pushing images
- **[Chapter 7: Publishing to Docker Hub](docker/docs/07-publishing-dockerhub.md)** - Docker Hub setup, authentication, automated builds, and publishing workflow
- **[Chapter 8: Advanced Topics](docker/docs/08-advanced-topics.md)** - Multi-stage builds, security hardening, image optimization, and resource limits
- **[Chapter 9: Troubleshooting and Best Practices](docker/docs/09-troubleshooting.md)** - Common issues, debugging strategies, log analysis, and maintenance tasks

### Additional Documentation

- **[Node-RED Flows README](workshop/flows/README.md)** - Documentation for Node-RED flows, including how to display MQTT data in FlowFuse Dashboard charts and gauges

## Project Structure

```
non-deegree-workshops-2025/
├── docker/                 # Docker Compose configuration
│   ├── docker-compose.yml
│   ├── docs/               # Docker teaching documentation
│   ├── nginx/
│   ├── node-red/
│   └── grafana/
├── api/                    # Flask API service
│   ├── app.py
│   └── routes/
├── simulator/              # IoT device simulator
│   └── devices/
├── workshop/
│   ├── docs/               # Workshop documentation
│   │   └── Architecture/  # System architecture docs
│   ├── code/               # Python code examples
│   └── flows/              # Node-RED flows documentation
├── requirements.txt        # Python dependencies
├── setup_python_env.sh     # Setup script (Linux/Mac)
├── setup_python_env.bat    # Setup script (Windows)
└── README.md
```

## Service Access

| Service | URL | Credentials |
|---------|-----|------------|
| Node-RED | http://localhost:1880 | - |
| Grafana | http://localhost:3000 | admin/admin |
| EMQX Dashboard | http://localhost:18083 | admin/public |
| Flask API | http://localhost:5000 | - |
| Nginx | http://localhost:8888 | - |

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /mqtt/publish` - Publish MQTT message
- `POST /mqtt/subscribe` - Subscribe to MQTT topic
- `POST /database/write` - Write to InfluxDB
- `POST /database/query` - Query InfluxDB
- `GET /devices/list` - List devices
- `POST /devices/register` - Register device

## Usage Examples

### Run a Workshop Example

```bash
# Activate virtual environment first
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run example code
python workshop/code/workshop-02/mqtt_publisher.py
```

### Start IoT Simulator

```bash
cd simulator
python iot_simulator.py
```

### Access Services

- View Node-RED flows: http://localhost:1880
- View Grafana dashboards: http://localhost:3000
- Check API: http://localhost:5000

## Troubleshooting

### Docker Services Not Starting

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs [service-name]

# Restart services
docker-compose restart
```

### Python Environment Issues

```bash
# Verify Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Connection Issues

- Verify all services are running: `docker-compose ps`
- Check ports are not in use
- Review service logs for errors
- Ensure firewall allows connections

## Development

### Adding New Workshops

1. Create documentation in `workshop/docs/`
2. Add code examples in `workshop/code/`
3. Update this README

### Modifying Services

- Docker services: Edit `docker/docker-compose.yml`
- Flask API: Edit files in `api/`
- Simulator: Edit files in `simulator/`

## Contributing

Contributions are welcome! Please:
1. Follow the existing code style
2. Add documentation for new features
3. Test your changes thoroughly

## License

This project is for educational purposes.

## Support

For issues and questions:
- Check [Workshop Documentation](#workshop-documentation) for step-by-step guides
- Review [Docker Documentation](#docker-documentation) for Docker-related questions
- Consult [Architecture Documentation](#architecture-documentation) for system understanding
- Review service logs: `docker-compose logs [service-name]`
- Consult official Docker and service documentation

## Acknowledgments

- Node-RED and FlowFuse Dashboard
- InfluxDB
- EMQX
- Grafana
- Flask

---

**Happy Learning! 🚀**

