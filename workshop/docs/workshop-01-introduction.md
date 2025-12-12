# Workshop 01: Introduction and Environment Setup

## Objectives

By the end of this workshop, you will be able to:
- Set up a Python virtual environment
- Install and verify Python dependencies
- Understand the IoT platform architecture
- Access all services through the web interface
- Run a simple Python script to test the environment

## Prerequisites

Before starting, ensure you have:
- Python 3.8 or higher installed
- Git installed (optional, for cloning repositories)
- Docker and Docker Compose installed
- A code editor (VS Code, PyCharm, or similar)

## Part 1: Python Environment Setup

### Step 1: Verify Python Installation

Check your Python version:

**Windows:**
```bash
python --version
```

**Linux/Mac:**
```bash
python3 --version
```

You should see Python 3.8 or higher. If not, install Python from [python.org](https://www.python.org/).

### Step 2: Create Virtual Environment

Virtual environments isolate project dependencies and prevent conflicts between projects.

**Windows:**
```bash
python -m venv venv
```

**Linux/Mac:**
```bash
python3 -m venv venv
```

This creates a `venv` folder containing the virtual environment.

### Step 3: Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt, indicating the virtual environment is active.

### Step 4: Upgrade pip

```bash
python -m pip install --upgrade pip
```

### Step 5: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs all required Python packages:
- `paho-mqtt`: MQTT client library
- `influxdb-client`: InfluxDB Python client
- `requests`: HTTP client for API calls
- `python-dotenv`: Environment variable management

### Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and update the configuration:
   - MQTT broker address (default: localhost)
   - InfluxDB connection details
   - API endpoints

### Step 7: Verify Installation

Run the test script:
```bash
python workshop/code/workshop-01/test_environment.py
```

This script verifies:
- All Python packages are installed correctly
- Environment variables are loaded
- Basic connectivity to services

## Part 2: Docker Services Overview

> **📚 Architecture Documentation**: For a comprehensive understanding of how all services work together, see the [Architecture Documentation](Architecture/architecture-index.md), including:
> - [Architecture Overview](Architecture/architecture-overview.md) - System architecture and component relationships
> - [Data Flow](Architecture/data-flow.md) - How data moves through the system
> - [Component Details](Architecture/component-details.md) - Detailed component documentation

### Starting the Services

Navigate to the `docker` directory and start all services:

```bash
cd docker
docker-compose up -d
```

This starts:
- **InfluxDB** (port 8086): Time-series database
- **EMQX** (port 1883): MQTT broker
- **Node-RED** (port 1880): Visual flow programming
- **Flask API** (port 5000): REST API service
- **Grafana** (port 3000): Data visualization
- **Nginx** (port 8888): Reverse proxy

### Accessing Services

- **Node-RED**: http://localhost:1880
- **Grafana**: http://localhost:3000 (admin/admin)
- **EMQX Dashboard**: http://localhost:18083 (admin/public)
- **Flask API**: http://localhost:5000
- **Nginx Proxy**: http://localhost:8888 (routes to all services)

### Service Health Checks

Check if all services are running:
```bash
docker-compose ps
```

All services should show "Up" status.

## Part 3: Your First Python Script

### Exercise: Hello World

Create and run `workshop/code/workshop-01/hello_world.py`:

```python
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
```

Run it:
```bash
python workshop/code/workshop-01/hello_world.py
```

## Part 4: IDE Setup (Optional but Recommended)

### VS Code

1. Install the Python extension
2. Open the project folder
3. Select the Python interpreter: `Ctrl+Shift+P` → "Python: Select Interpreter" → Choose `venv`

### PyCharm

1. Open the project
2. Go to Settings → Project → Python Interpreter
3. Select the `venv` interpreter

## Troubleshooting

### Python Not Found
- Ensure Python is in your PATH
- Try `python3` instead of `python` on Linux/Mac

### pip Errors
- Upgrade pip: `python -m pip install --upgrade pip`
- Use `python -m pip` instead of `pip`

### Virtual Environment Activation Issues
- Windows: Use `venv\Scripts\activate.bat`
- Linux/Mac: Use `source venv/bin/activate`
- Ensure you're in the project root directory

### Docker Services Not Starting
- Check Docker is running: `docker ps`
- Check ports are not in use
- Review logs: `docker-compose logs`

## Next Steps

- Workshop 02: MQTT Basics - Learn to publish and subscribe to MQTT topics
- Explore the Node-RED interface
- Check out the Grafana dashboards

## Summary

In this workshop, you:
- ✅ Set up a Python virtual environment
- ✅ Installed all required dependencies
- ✅ Configured environment variables
- ✅ Started all Docker services
- ✅ Ran your first Python script
- ✅ Accessed all service interfaces

You're now ready to start building IoT applications!

