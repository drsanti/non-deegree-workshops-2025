# SVG & D3.js Visualization Project

A modern Next.js application demonstrating data visualization techniques using React SVG, D3.js, and Radix UI. This project includes both IoT sensor data visualization demos and a comprehensive signal visualization workshop.

## Table of Contents

- [Features](#features)
- [Workshop](#workshop)
- [Practice](#practice)
- [Demos](#demos)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Component Usage](#component-usage)
- [Development](#development)

## Features

- **Real-time Sensor Monitoring**: Live updates of sensor readings every 5 seconds
- **Multiple Visualization Types**:
  - **Line Charts**: Time-series data visualization using D3.js
  - **Bar Charts**: Comparative sensor data analysis
  - **Gauge Charts**: Real-time gauge meters for current sensor values
- **Signal Visualization Workshop**: Progressive examples teaching signal generation and D3.js
- **Responsive Design**: Mobile-friendly grid layout
- **Modern UI Components**: Built with Radix UI primitives and Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Workshop

This project includes a comprehensive **Signal Visualization Workshop** with 5 progressive examples teaching signal generation, noise processing, and D3.js visualization.

### Workshop Examples

1. **[Example 01: Basic Sine Wave](./app/workshop/apps/ex01)** - Introduction to signal generation and D3.js visualization
2. **[Example 02: Signal with Noise](./app/workshop/apps/ex02)** - Adding Gaussian noise and dual visualization
3. **[Example 03: Multiple Signal Types](./app/workshop/apps/ex03)** - Supporting sine, square, and sawtooth waves
4. **[Example 04: Signal + Noise with Controls](./app/workshop/apps/ex04)** - Interactive parameter controls and React hooks
5. **[Example 05: Full Signal Visualizer](./app/workshop/apps/ex05)** - Complete application with modular architecture

### Workshop Documentation

Complete tutorial documentation is available in [`app/workshop/docs/`](./app/workshop/docs/README.md), including:
- Step-by-step guides for each example
- Code walkthroughs and explanations
- Exercises with solutions
- Key concepts and best practices

**Start the workshop:** Navigate to `/workshop/apps/ex01` after starting the development server.

## Practice

The **Practice** section provides comprehensive examples demonstrating all signal generation and noise functions available in the project.

### Practice Examples

The practice page includes 13 interactive examples covering:

**Signal Types (Practice 1-5):**
- Square Wave
- Sine Wave
- Sawtooth Wave
- Triangle Wave
- Pulse Wave

**Noise Types (Practice 6-9):**
- Gaussian Noise (White Noise)
- Uniform Noise
- Pink Noise (1/f Noise)
- Brown Noise (1/f² Noise)

**Signal + Noise Combinations (Practice 10-13):**
- Sine Wave + Gaussian Noise
- Square Wave + Uniform Noise
- Sine Wave + Pink Noise
- Sawtooth Wave + Brown Noise

### Practice Components

The practice section includes:
- **Signal Generator Functions**: All signal generation utilities (`lib/SignalGenerator.ts`)
- **Signal Plot Component**: Reusable visualization component (`components/SignalPlot.tsx`)
- **Interactive Examples**: Live demonstrations of each function

**Access the practice page:** Navigate to `/practice` after starting the development server.

## Demos

- **[IoT Dashboard](./app/demo/iot-dash)** - Real-time IoT sensor monitoring dashboard
- **[Signal Visualizer](./app/demo/signals)** - Interactive signal generation and visualization tool

## Tech Stack

- **Next.js 16+**: React framework with App Router
- **TypeScript**: Type-safe development
- **D3.js v7**: Data visualization library
- **Radix UI**: Accessible UI component primitives
- **Tailwind CSS v4**: Utility-first CSS framework
- **React SVG**: SVG rendering in React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Quick Links

- **Main Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Practice Examples**: [http://localhost:3000/practice](http://localhost:3000/practice)
- **IoT Dashboard Demo**: [http://localhost:3000/demo/iot-dash](http://localhost:3000/demo/iot-dash)
- **Signal Visualizer Demo**: [http://localhost:3000/demo/signals](http://localhost:3000/demo/signals)
- **Workshop Example 01**: [http://localhost:3000/workshop/apps/ex01](http://localhost:3000/workshop/apps/ex01)

## Project Structure

```
svg-d3-visualizarion/
├── app/
│   ├── demo/                    # Demo applications
│   │   ├── iot-dash/           # IoT sensor dashboard
│   │   └── signals/            # Signal visualizer demo
│   ├── practice/               # Practice examples
│   │   ├── components/         # SignalPlot component
│   │   └── lib/                # SignalGenerator utilities
│   ├── workshop/               # Workshop examples and docs
│   │   ├── apps/               # Progressive examples (ex01-ex05)
│   │   └── docs/               # Tutorial documentation
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main dashboard page
│   └── globals.css              # Global styles with Tailwind
├── components/
│   ├── ui/                      # Radix UI components
│   ├── charts/                  # D3 visualization components
│   ├── sensors/                 # Sensor-specific components
│   └── signals/                # Signal visualization components
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions and helpers
├── types/                       # TypeScript type definitions
└── package.json
```

## Component Usage

### LineChart

Displays time-series data as a line chart with area fill:

```tsx
import LineChart from '@/components/charts/LineChart';

<LineChart
  data={sensorData}
  width={800}
  height={400}
  sensorType="temperature"
  color="#ef4444"
/>
```

### BarChart

Shows comparative sensor data:

```tsx
import BarChart from '@/components/charts/BarChart';

<BarChart
  data={sensors}
  width={1000}
  height={400}
/>
```

### GaugeChart

Real-time gauge meter for current sensor values:

```tsx
import GaugeChart from '@/components/charts/GaugeChart';

<GaugeChart
  value={22.5}
  min={-10}
  max={50}
  unit="°C"
  sensorType="temperature"
  width={300}
  height={300}
  label="Temperature"
/>
```

### SensorCard

Complete sensor display card with gauge and line chart:

```tsx
import SensorCard from '@/components/sensors/SensorCard';

<SensorCard sensor={sensorData} />
```

## Sensor Data Types

The project supports the following sensor types:

- `temperature` - Temperature readings (°C)
- `humidity` - Humidity levels (%)
- `pressure` - Atmospheric pressure (hPa)
- `light` - Light intensity (lux)
- `motion` - Motion detection (binary)
- `air_quality` - Air quality index (AQI)

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Linting

```bash
npm run lint
```

## Dependencies

### Core Dependencies

- `next`: ^16.0.5
- `react`: ^19.2.0
- `react-dom`: ^19.2.0
- `d3`: ^7.9.0
- `@radix-ui/react-slot`: ^1.2.4
- `@radix-ui/react-tabs`: ^1.1.13
- `@radix-ui/react-dialog`: ^1.1.15
- `@radix-ui/react-select`: ^2.2.6
- `clsx`: ^2.1.1
- `tailwind-merge`: ^3.4.0
- `class-variance-authority`: Latest

## License

This project is part of the non-degree workshops repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
