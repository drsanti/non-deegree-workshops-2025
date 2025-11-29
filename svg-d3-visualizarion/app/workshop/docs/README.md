# Signal Visualization Workshop

A progressive series of 5 hands-on examples teaching signal generation, noise processing, and D3.js visualization using React, TypeScript, and Next.js.

## Overview

This workshop series guides you through building increasingly sophisticated signal visualization applications. Starting with basic sine wave generation and progressing to a full-featured signal visualizer with multiple signal types, noise generation, and interactive controls.

## Learning Path

The examples are designed to be completed sequentially, with each building upon concepts from the previous:

1. **[Example 01: Basic Sine Wave](./ex01.md)** - Introduction to signal generation and D3.js visualization
2. **[Example 02: Signal with Noise](./ex02.md)** - Adding Gaussian noise and dual visualization
3. **[Example 03: Multiple Signal Types](./ex03.md)** - Supporting sine, square, and sawtooth waves
4. **[Example 04: Signal + Noise with Controls](./ex04.md)** - Interactive parameter controls and React hooks
5. **[Example 05: Full Signal Visualizer](./ex05.md)** - Complete application with modular architecture

## Prerequisites

### Required Knowledge
- **React Basics**: Components, hooks (`useState`, `useEffect`, `useRef`), JSX
- **TypeScript Basics**: Types, interfaces, type annotations
- **JavaScript Fundamentals**: Functions, arrays, objects, loops
- **HTML/CSS Basics**: Understanding of DOM structure and styling

### Recommended Knowledge
- **D3.js Concepts**: Scales, axes, line generators (will be covered in examples)
- **Signal Processing**: Basic understanding of waveforms (will be explained)
- **Next.js**: App Router structure (examples use Next.js but concepts apply to React)

### Development Environment
- Node.js 18+ installed
- Code editor (VS Code recommended)
- Terminal/command line access
- Modern web browser

## Setup Instructions

1. **Navigate to the project directory:**
   ```bash
   cd svg-d3-visualizarion
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000/workshop/apps/ex01` to start with Example 01

## Workshop Structure

Each example includes:
- **Live Demo**: Working code you can run and interact with
- **Tutorial Documentation**: Detailed explanations and code walkthroughs
- **Exercises**: Practice problems to reinforce learning
- **Key Concepts**: Important theory and terminology

## Common Concepts

### Signal Parameters

- **Frequency (Hz)**: Number of complete cycles per second
- **Amplitude**: Maximum displacement from zero (peak value)
- **Phase (radians)**: Horizontal shift of the waveform
- **Sample Rate (samples/s)**: Number of data points per second
- **Duration (seconds)**: Length of the signal in time

### Signal Types

- **Sine Wave**: Smooth, continuous oscillation (sinusoidal)
- **Square Wave**: Alternates between two constant values
- **Sawtooth Wave**: Linear rise followed by sharp drop

### D3.js Concepts

- **Scales**: Map data values to pixel coordinates (`scaleLinear`)
- **Axes**: Visual representation of scales (`axisBottom`, `axisLeft`)
- **Line Generators**: Convert data points to SVG path strings (`line`)
- **Area Generators**: Create filled areas under lines (`area`)

### React Patterns

- **Hooks**: `useState` for state, `useEffect` for side effects, `useMemo` for optimization
- **Refs**: `useRef` for accessing DOM elements
- **Controlled Components**: Input values controlled by React state

## Getting Started

1. **Start with Example 01**: Read the tutorial and run the code
2. **Complete Exercises**: Try the practice problems
3. **Move to Next Example**: Progress through examples sequentially
4. **Experiment**: Modify code to see how changes affect the visualization

## File Structure

```
app/workshop/
├── apps/
│   ├── ex01/          # Basic sine wave
│   ├── ex02/          # Signal with noise
│   ├── ex03/          # Multiple signal types
│   ├── ex04/          # Interactive controls
│   └── ex05/          # Full visualizer
└── docs/
    ├── README.md      # This file
    ├── ex01.md        # Example 01 tutorial
    ├── ex02.md        # Example 02 tutorial
    ├── ex03.md        # Example 03 tutorial
    ├── ex04.md        # Example 04 tutorial
    └── ex05.md        # Example 05 tutorial
```

## Additional Resources

- [D3.js Documentation](https://d3js.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

## Troubleshooting

### Common Issues

**Chart not rendering:**
- Check browser console for errors
- Ensure SVG ref is properly attached
- Verify data array is not empty

**TypeScript errors:**
- Ensure `@types/d3` is installed: `npm install --save-dev @types/d3`
- Check type annotations match actual data structure

**Styling issues:**
- Verify Tailwind CSS is properly configured
- Check that `globals.css` is imported in layout

## Next Steps

After completing all examples:

1. **Extend Functionality**: Add new signal types or visualization features
2. **Improve UI**: Enhance the user interface with additional controls
3. **Optimize Performance**: Implement advanced memoization strategies
4. **Add Features**: Export data, save configurations, real-time updates

---

**Ready to begin?** Start with [Example 01: Basic Sine Wave](./ex01.md)

