# Architecture Documentation Index

This directory contains comprehensive documentation about the IoT Home Automation Learning Platform architecture.

## Documentation Files

### 📐 [Architecture Overview](architecture-overview.md)

**Start here!** Provides a high-level overview of the entire system architecture.

**Contents**:
- System overview and key components
- Complete architecture diagrams
- Docker services overview
- Network architecture
- Service dependencies
- Python integration patterns
- Service startup sequence

**Best for**: Understanding the big picture and how everything fits together.

---

### 🔄 [Data Flow](data-flow.md)

Explains how data moves through the system from sensors to visualization.

**Contents**:
- Sensor data flow (complete journey)
- Command flow (sending commands to devices)
- Query flow (retrieving historical data)
- Visualization flow (real-time and historical)
- Data formats (MQTT, InfluxDB, REST API)
- Data transformation points
- Error handling

**Best for**: Understanding how data is generated, transmitted, stored, and displayed.

---

### 🔧 [Component Details](component-details.md)

Detailed documentation of each individual component.

**Contents**:
- Docker services (EMQX, InfluxDB, Node-RED, Flask API, Grafana, Nginx, Simulator)
- Python components (environment, workshop code, API service, simulator)
- Configuration details
- Inter-service communication
- Service lifecycle
- Resource requirements
- Troubleshooting by component

**Best for**: Deep dive into specific components and troubleshooting.

---

## Quick Navigation

### By Topic

**Understanding the System**:
1. Start with [Architecture Overview](architecture-overview.md) for the big picture
2. Read [Data Flow](data-flow.md) to understand how data moves
3. Reference [Component Details](component-details.md) for specific components

**Learning Path**:
1. [Workshop 01: Introduction](../workshop-01-introduction.md) - Setup and basics
2. [Architecture Overview](architecture-overview.md) - Understand the system
3. [Workshop 02: MQTT Basics](../workshop-02-mqtt-basics.md) - Start coding

**Troubleshooting**:
1. Check [Component Details](component-details.md) for component-specific issues
2. Review [Data Flow](data-flow.md) to understand expected data paths
3. Verify configuration in [Architecture Overview](architecture-overview.md)

### By Role

**Students**:
- Read [Architecture Overview](architecture-overview.md) first
- Reference [Data Flow](data-flow.md) when working with data
- Use [Component Details](component-details.md) for troubleshooting

**Instructors**:
- Use [Architecture Overview](architecture-overview.md) for teaching system concepts
- Reference [Data Flow](data-flow.md) for explaining data movement
- Use [Component Details](component-details.md) for technical details

**Developers**:
- Start with [Component Details](component-details.md) for implementation
- Reference [Data Flow](data-flow.md) for integration points
- Use [Architecture Overview](architecture-overview.md) for system design

## Diagram Legend

All architecture documents use Mermaid diagrams. Here's what the symbols mean:

### Diagram Types

- **Graph Diagrams**: Show relationships and connections
- **Sequence Diagrams**: Show time-ordered interactions
- **Flowcharts**: Show process flows

### Common Elements

- **Rectangles**: Services, components, or processes
- **Cylinders**: Databases or data storage
- **Arrows**: Data flow or communication
- **Dotted Lines**: Optional or conditional flows
- **Subgraphs**: Logical groupings

## Related Documentation

### Workshop Documentation

- [Workshop 01: Introduction](../workshop-01-introduction.md) - Getting started
- [Workshop 02: MQTT Basics](../workshop-02-mqtt-basics.md) - MQTT fundamentals
- [Workshop 03: Database Operations](../workshop-03-database-operations.md) - InfluxDB usage
- [Workshop 04: REST API](../workshop-04-rest-api.md) - Flask API usage
- [Workshop 05: Node-RED Integration](../workshop-05-node-red-integration.md) - Node-RED flows
- [Workshop 06: Data Visualization](../workshop-06-data-visualization.md) - Grafana and dashboards
- [Workshop 07: IoT Simulator](../workshop-07-iot-simulator.md) - Device simulation
- [Workshop 08: Home Automation](../workshop-08-home-automation.md) - Automation scenarios
- [Workshop 09: Advanced Topics](../workshop-09-advanced-topics.md) - Advanced concepts
- [Workshop 10: Capstone Project](../workshop-10-capstone-project.md) - Final project

### Other Documentation

- [Node-RED Flows README](../flows/README.md) - Node-RED flow documentation
- [Main README](../../README.md) - Project setup and usage

## Contributing

When updating architecture documentation:

1. **Update diagrams**: Keep Mermaid diagrams synchronized with code changes
2. **Update ports/URLs**: Ensure all service URLs and ports are accurate
3. **Test examples**: Verify all code examples work
4. **Cross-reference**: Update related documents when making changes

## Feedback

If you find errors or have suggestions for improving the architecture documentation:

1. Check existing documentation first
2. Verify the information is accurate
3. Update the relevant document(s)
4. Update cross-references if needed

