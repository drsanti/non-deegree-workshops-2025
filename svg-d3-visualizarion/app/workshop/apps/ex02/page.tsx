"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  time: number;
  value: number;
}

// Generate sine wave signal
function generateSineWave(
  frequency: number,
  amplitude: number,
  phase: number,
  sampleRate: number,
  duration: number
): DataPoint[] {
  const dataPoints: DataPoint[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  const timeStep = 1 / sampleRate;

  for (let i = 0; i < numSamples; i++) {
    const time = i * timeStep;
    const value = amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
    dataPoints.push({ time, value });
  }

  return dataPoints;
}

// Generate Gaussian (normal) noise
function generateGaussianNoise(
  length: number,
  mean: number = 0,
  stdDev: number = 0.1
): number[] {
  const noise: number[] = [];
  for (let i = 0; i < length; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    noise.push(mean + z0 * stdDev);
  }
  return noise;
}

// Add noise to signal
function addNoiseToSignal(
  signal: DataPoint[],
  noiseLevel: number = 0.1
): DataPoint[] {
  const noise = generateGaussianNoise(signal.length, 0, noiseLevel);
  return signal.map((point, i) => ({
    time: point.time,
    value: point.value + noise[i],
  }));
}

function renderChart(
  svgRef: React.RefObject<SVGSVGElement | null>,
  cleanData: DataPoint[],
  noisyData: DataPoint[],
  title: string,
  color: string
) {
  if (!svgRef.current) return;

  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  const width = 800;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  svg.attr("width", width).attr("height", height);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Combine data for domain calculation
  const allData = [...cleanData, ...noisyData];
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(allData, (d) => d.time) as [number, number])
    .range([0, chartWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(allData, (d) => d.value) as [number, number])
    .range([chartHeight, 0])
    .nice();

  // Create line generators
  const line = d3
    .line<DataPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  // Draw clean signal
  g.append("path")
    .datum(cleanData)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .attr("d", line);

  // Draw noisy signal
  g.append("path")
    .datum(noisyData)
    .attr("fill", "none")
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7)
    .attr("d", line);

  // Add axes
  const xAxis = d3.axisBottom(xScale).ticks(10);
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(xAxis);

  xAxisGroup
    .selectAll("text")
    .style("font-size", "14px")
    .style("fill", "currentColor");

  xAxisGroup
    .append("text")
    .attr("x", chartWidth / 2)
    .attr("y", 35)
    .attr("fill", "currentColor")
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "500")
    .text("Time (s)");

  const yAxis = d3.axisLeft(yScale).ticks(10);
  const yAxisGroup = g.append("g").call(yAxis);

  yAxisGroup
    .selectAll("text")
    .style("font-size", "14px")
    .style("fill", "currentColor");

  yAxisGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -chartHeight / 2)
    .attr("fill", "currentColor")
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "500")
    .text("Amplitude");

  // Add grid
  g.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(xAxis.tickSize(-chartHeight).tickFormat(() => ""))
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.2);

  g.append("g")
    .attr("class", "grid")
    .call(yAxis.tickSize(-chartWidth).tickFormat(() => ""))
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.2);

  // Add legend
  const legend = g
    .append("g")
    .attr("transform", `translate(${chartWidth - 150}, 20)`);

  legend
    .append("line")
    .attr("x1", 0)
    .attr("x2", 30)
    .attr("y1", 0)
    .attr("y2", 0)
    .attr("stroke", color)
    .attr("stroke-width", 2);
  legend
    .append("text")
    .attr("x", 35)
    .attr("y", 4)
    .attr("fill", "currentColor")
    .style("font-size", "14px")
    .text("Clean Signal");

  legend
    .append("line")
    .attr("x1", 0)
    .attr("x2", 30)
    .attr("y1", 20)
    .attr("y2", 20)
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7);
  legend
    .append("text")
    .attr("x", 35)
    .attr("y", 24)
    .attr("fill", "currentColor")
    .style("font-size", "14px")
    .text("Noisy Signal");
}

export default function Example02() {
  const cleanSvgRef = useRef<SVGSVGElement>(null);
  const noisySvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Generate signal with fixed parameters
    const frequency = 1;
    const amplitude = 1;
    const phase = 0;
    const sampleRate = 100;
    const duration = 2;
    const noiseLevel = 0.2;

    const cleanSignal = generateSineWave(
      frequency,
      amplitude,
      phase,
      sampleRate,
      duration
    );
    const noisySignal = addNoiseToSignal(cleanSignal, noiseLevel);

    renderChart(
      cleanSvgRef,
      cleanSignal,
      cleanSignal,
      "Clean Signal",
      "#3b82f6"
    );
    renderChart(
      noisySvgRef,
      cleanSignal,
      noisySignal,
      "Signal + Noise",
      "#3b82f6"
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Example 02: Signal with Noise
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate a sine wave and add Gaussian noise to visualize the
            difference between clean and noisy signals
          </p>
        </header>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Clean Signal</h2>
            <svg ref={cleanSvgRef} className="w-full" viewBox="0 0 800 300" />
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Signal + Noise</h2>
            <svg ref={noisySvgRef} className="w-full" viewBox="0 0 800 300" />
          </div>
        </div>
      </div>
    </div>
  );
}
