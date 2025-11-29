# IoT Sensor Data Visualization Dashboard

A modern Next.js application for visualizing IoT sensor data using React SVG, D3.js, and Radix UI. This project demonstrates real-time sensor data visualization with interactive charts and dashboards.

## Features

- **Real-time Sensor Monitoring**: Live updates of sensor readings every 5 seconds
- **Multiple Visualization Types**:
  - **Line Charts**: Time-series data visualization using D3.js
  - **Bar Charts**: Comparative sensor data analysis
  - **Gauge Charts**: Real-time gauge meters for current sensor values
- **Responsive Design**: Mobile-friendly grid layout
- **Modern UI Components**: Built with Radix UI primitives and Tailwind CSS
- **TypeScript**: Full type safety throughout the application

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

## Project Structure

```
svg-d3-visualizarion/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx             # Main dashboard page
│   └── globals.css           # Global styles with Tailwind
├── components/
│   ├── ui/                  # Radix UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── tabs.tsx
│   ├── charts/              # D3 visualization components
│   │   ├── LineChart.tsx    # Time series line chart
│   │   ├── BarChart.tsx     # Sensor comparison bar chart
│   │   └── GaugeChart.tsx   # Real-time gauge visualization
│   └── sensors/             # Sensor-specific components
│       ├── SensorCard.tsx   # Individual sensor display card
│       └── SensorGrid.tsx   # Grid layout for multiple sensors
├── lib/
│   ├── d3-utils.ts          # D3 helper functions
│   ├── sensor-data.ts       # Mock IoT sensor data generator
│   └── utils.ts             # Utility functions (cn helper)
├── types/
│   └── sensor.ts            # TypeScript types for sensor data
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

## Mock Data

The project includes a mock data generator (`lib/sensor-data.ts`) that simulates IoT sensor readings. You can:

- Generate time-series data for sensors
- Create dashboard sensor configurations
- Simulate real-time updates

Example:

```typescript
import { generateDashboardSensors, updateSensorReading } from '@/lib/sensor-data';

// Generate 6 sensors
const sensors = generateDashboardSensors(6);

// Update sensor with new reading
const updatedSensor = updateSensorReading(sensor);
```

## Customization

### Adding New Sensor Types

1. Update `types/sensor.ts` to add new sensor types
2. Add configuration in `lib/sensor-data.ts` (`SENSOR_CONFIGS`)
3. Add color mapping in `lib/d3-utils.ts` (`createSensorColorScale`)

### Styling

The project uses Tailwind CSS with custom theme tokens defined in `app/globals.css`. You can customize:

- Colors: Update CSS variables in `globals.css`
- Components: Modify component files in `components/ui/`
- Charts: Adjust D3.js styling in chart components

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

## Example Sensor Data Format

```typescript
interface DashboardSensor {
  metadata: {
    id: string;
    name: string;
    type: SensorType;
    unit: string;
    location: string;
    minValue: number;
    maxValue: number;
    lastUpdated: Date;
  };
  currentValue: number;
  timeSeries: Array<{
    timestamp: Date;
    value: number;
  }>;
  status: 'active' | 'inactive' | 'error';
}
```

## License

This project is part of the non-degree workshops repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
