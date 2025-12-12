# Workshop 10: Capstone Project

## Objectives

By the end of this workshop, you will be able to:
- Design and implement a complete IoT system
- Integrate all learned concepts
- Create a comprehensive solution
- Present and document your project

## Project Overview

Build a complete Smart Home Automation System that demonstrates all concepts learned throughout the workshops.

## Project Requirements

### Core Features

1. **Device Management**
   - Register and manage multiple IoT devices
   - Track device status and health
   - Handle device failures gracefully

2. **Data Collection**
   - Collect data from multiple sensor types
   - Store data in InfluxDB
   - Publish data via MQTT

3. **Automation Rules**
   - Implement at least 5 automation rules
   - Support scheduling
   - Handle edge cases

4. **Visualization**
   - Create Grafana dashboards
   - Build Node-RED dashboard
   - Real-time data display

5. **API Integration**
   - RESTful API for all operations
   - Device control endpoints
   - Data query endpoints

6. **Monitoring**
   - System health monitoring
   - Alert system
   - Event logging

## Project Structure

```
capstone-project/
├── devices/
│   ├── sensors/
│   │   ├── temperature.py
│   │   ├── humidity.py
│   │   └── motion.py
│   └── actuators/
│       ├── light.py
│       ├── ac.py
│       └── switch.py
├── automation/
│   ├── rules.py
│   ├── scheduler.py
│   └── engine.py
├── api/
│   ├── endpoints.py
│   └── models.py
├── dashboard/
│   ├── grafana_config.json
│   └── node_red_flows.json
├── monitoring/
│   ├── health_check.py
│   └── alerts.py
├── tests/
│   └── test_system.py
├── docs/
│   ├── design.md
│   ├── api.md
│   └── deployment.md
└── main.py
```

## Implementation Guide

### Phase 1: Device Simulation (Week 1)

1. Create device classes for:
   - Temperature sensors (3 devices)
   - Humidity sensors (3 devices)
   - Motion sensors (2 devices)
   - Smart lights (4 devices)
   - AC units (2 devices)
   - Smart switches (3 devices)

2. Implement data generation:
   - Realistic sensor readings
   - Device state management
   - Error simulation

### Phase 2: Data Pipeline (Week 1-2)

1. MQTT Integration:
   - Publish all sensor data
   - Subscribe to control topics
   - Handle QoS levels

2. Database Integration:
   - Store all sensor data
   - Store automation events
   - Store device states

3. API Integration:
   - Device registration
   - Data querying
   - Control commands

### Phase 3: Automation Engine (Week 2)

1. Rule Engine:
   - Temperature-based rules
   - Motion-based rules
   - Time-based rules
   - Multi-condition rules

2. Scheduler:
   - Daily routines
   - Weekly schedules
   - Event-based triggers

3. Error Handling:
   - Rule validation
   - Device failure handling
   - Fallback mechanisms

### Phase 4: Visualization (Week 2-3)

1. Grafana Dashboards:
   - Overview dashboard
   - Device-specific dashboards
   - Automation dashboard
   - Analytics dashboard

2. Node-RED Dashboard:
   - Real-time sensor display
   - Control interface
   - Status indicators

### Phase 5: API and Integration (Week 3)

1. REST API:
   - Complete CRUD operations
   - Authentication
   - Rate limiting
   - Error handling

2. Integration:
   - Connect all components
   - End-to-end testing
   - Performance optimization

### Phase 6: Monitoring and Documentation (Week 3-4)

1. Monitoring:
   - Health checks
   - Alert system
   - Performance metrics
   - Logging

2. Documentation:
   - System design
   - API documentation
   - User guide
   - Deployment guide

## Example Implementation

### Main Application

Create `workshop/code/workshop-10/capstone_project.py`:

```python
"""
Capstone Project: Complete Smart Home Automation System
"""

import asyncio
import logging
from datetime import datetime
from devices import DeviceManager
from automation import AutomationEngine
from api import APIServer
from monitoring import HealthMonitor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SmartHomeSystem:
    def __init__(self):
        self.device_manager = DeviceManager()
        self.automation_engine = AutomationEngine()
        self.api_server = APIServer()
        self.health_monitor = HealthMonitor()
        self.running = False
    
    async def initialize(self):
        """Initialize all components"""
        logger.info("Initializing Smart Home System...")
        
        # Initialize device manager
        await self.device_manager.initialize()
        
        # Initialize automation engine
        await self.automation_engine.initialize()
        
        # Start API server
        await self.api_server.start()
        
        # Start health monitor
        await self.health_monitor.start()
        
        logger.info("System initialized successfully")
    
    async def run(self):
        """Run the system"""
        self.running = True
        logger.info("Smart Home System running...")
        
        try:
            while self.running:
                # Process automation rules
                await self.automation_engine.process_rules()
                
                # Update device states
                await self.device_manager.update_devices()
                
                # Check system health
                await self.health_monitor.check_health()
                
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("Shutting down...")
            await self.shutdown()
    
    async def shutdown(self):
        """Shutdown the system"""
        self.running = False
        await self.device_manager.shutdown()
        await self.automation_engine.shutdown()
        await self.api_server.shutdown()
        await self.health_monitor.shutdown()
        logger.info("System shut down")

async def main():
    system = SmartHomeSystem()
    await system.initialize()
    await system.run()

if __name__ == "__main__":
    asyncio.run(main())
```

## Evaluation Criteria

### Functionality (40%)
- All core features implemented
- System works end-to-end
- Error handling works correctly

### Code Quality (20%)
- Clean, readable code
- Proper documentation
- Follows best practices

### Architecture (20%)
- Well-designed structure
- Proper separation of concerns
- Scalable design

### Documentation (10%)
- Complete documentation
- Clear instructions
- API documentation

### Presentation (10%)
- Clear demonstration
- Explains design decisions
- Answers questions

## Deliverables

1. **Source Code**
   - Complete, working code
   - Well-organized structure
   - Comments and documentation

2. **Documentation**
   - System design document
   - API documentation
   - User guide
   - Deployment instructions

3. **Dashboards**
   - Grafana dashboards (exported JSON)
   - Node-RED flows (exported JSON)
   - Screenshots

4. **Presentation**
   - 10-15 minute presentation
   - Live demonstration
   - Q&A session

## Tips for Success

1. **Start Early**: Begin implementation as soon as possible
2. **Iterate**: Build incrementally, test frequently
3. **Document**: Write documentation as you code
4. **Test**: Test all components thoroughly
5. **Ask Questions**: Don't hesitate to ask for help

## Resources

- Previous workshop materials
- API documentation
- Service documentation
- Community forums

## Submission

Submit your project including:
- Source code repository
- Documentation files
- Dashboard exports
- Presentation slides
- Demo video (optional)

## Congratulations!

Completing this capstone project demonstrates your mastery of:
- Python programming for IoT
- MQTT messaging
- Time-series databases
- REST API development
- Data visualization
- System integration
- Home automation

You're now ready to build real-world IoT solutions!

