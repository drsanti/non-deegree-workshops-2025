# Robot Twin Workshop - Quick Start

Welcome to the Robot Twin Workshop! This guide will help you get started with running the robot-twin application using Docker.

---

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed
- (Optional) [docker-compose](https://docs.docker.com/compose/) for multi-container setup
- Download the provided Docker image (see below)

## Download the Docker Image

Download the pre-built Docker image from Google Drive:

[Download robot-app.tar](https://drive.google.com/file/d/1GBHg0M3iuxuRpX5MORB-8Q2sBWCBoyCs/view?usp=sharing)

Save the download file in `robot-twin` directory.

---

## Load the Docker Image

```sh
docker load -i robot-app.tar
```

## Start the Application
---
You can start the application using either **docker-compose** or **docker run**:

### Option 1: Using docker-compose

```sh
docker-compose up -d
```

### Option 2: Using docker run
```sh
docker run -d --name robot-twin -p 9500:9500 robot-app
```

---

## Directory Structure

```
robot-twin/
├── codes/                # Example Python scripts for robot control
├── docs/                 # Workshop documentation and guides
├── docker-compose.yaml   # Compose file for multi-container setup
├── README.md             # This file
└── ...
```

---

## Usage

1. Start the application as described above.
2. Use the example scripts in the `codes/` directory to interact with the robot twin via MQTT.
3. Refer to the documentation in the `docs/` directory for workshop exercises and detailed guides.

---

## Documentation

- Workshop 1: [Basic Publisher](docs/robot1_publish.md)
- Workshop 2: [Sequence Control](docs/robot2_sequence.md)
- Workshop 3: [Feedback Subscriber](docs/robot3_feedback.md)
- Workshop 4: [Interactive Control](docs/robot4_interactive.md)
- Workshop 5: [Advanced Control](docs/robot5_advanced.md)

---

## Troubleshooting

- Ensure Docker is running and the image is loaded successfully.
- If ports are in use, stop other services or change the port mapping.
- For MQTT communication, make sure the broker is accessible at `127.0.0.1:1883` (or adjust scripts as needed).
- Check the logs with `docker logs robot-twin` for error messages.

---

For further help, see the documentation in the `docs/` folder or contact your workshop instructor.
