"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";

interface DataPoint {
  time: number;
  value: number;
}

type SignalType = "sine" | "square" | "sawtooth";

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

// Generate square wave signal
function generateSquareWave(
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
    const sineValue = Math.sin(2 * Math.PI * frequency * time + phase);
    const value = amplitude * Math.sign(sineValue);
    dataPoints.push({ time, value });
  }

  return dataPoints;
}

// Generate sawtooth wave signal
function generateSawtoothWave(
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
    const normalizedTime = (time * frequency + phase / (2 * Math.PI)) % 1;
    const value = amplitude * (2 * normalizedTime - 1);
    dataPoints.push({ time, value });
  }

  return dataPoints;
}

// Generate signal based on type
function generateSignal(
  type: SignalType,
  frequency: number,
  amplitude: number,
  phase: number,
  sampleRate: number,
  duration: number
): DataPoint[] {
  switch (type) {
    case "sine":
      return generateSineWave(
        frequency,
        amplitude,
        phase,
        sampleRate,
        duration
      );
    case "square":
      return generateSquareWave(
        frequency,
        amplitude,
        phase,
        sampleRate,
        duration
      );
    case "sawtooth":
      return generateSawtoothWave(
        frequency,
        amplitude,
        phase,
        sampleRate,
        duration
      );
  }
}

function renderChart(
  svgRef: React.RefObject<SVGSVGElement | null>,
  data: DataPoint[],
  color: string
) {
  if (!svgRef.current) return;

  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  svg.attr("width", width).attr("height", height);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.time) as [number, number])
    .range([0, chartWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.value) as [number, number])
    .range([chartHeight, 0])
    .nice();

  const line = d3
    .line<DataPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const area = d3
    .area<DataPoint>()
    .x((d) => xScale(d.time))
    .y0(chartHeight)
    .y1((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  g.append("path")
    .datum(data)
    .attr("fill", color)
    .attr("fill-opacity", 0.1)
    .attr("d", area);

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .attr("d", line);

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
}

const signalColors: Record<SignalType, string> = {
  sine: "#3b82f6",
  square: "#ef4444",
  sawtooth: "#10b981",
};

export default function Example03() {
  const [signalType, setSignalType] = useState<SignalType>("sine");
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const frequency = 1;
    const amplitude = 1;
    const phase = 0;
    const sampleRate = 100;
    const duration = 2;

    const data = generateSignal(
      signalType,
      frequency,
      amplitude,
      phase,
      sampleRate,
      duration
    );

    renderChart(svgRef, data, signalColors[signalType]);
  }, [signalType]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Example 03: Multiple Signal Types
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate and visualize different signal types: sine, square, and
            sawtooth waves
          </p>
        </header>

        <div className="mb-6 flex gap-4">
          <Button
            variant={signalType === "sine" ? "default" : "outline"}
            onClick={() => setSignalType("sine")}
          >
            Sine Wave
          </Button>
          <Button
            variant={signalType === "square" ? "default" : "outline"}
            onClick={() => setSignalType("square")}
          >
            Square Wave
          </Button>
          <Button
            variant={signalType === "sawtooth" ? "default" : "outline"}
            onClick={() => setSignalType("sawtooth")}
          >
            Sawtooth Wave
          </Button>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 capitalize">
            {signalType} Wave Visualization
          </h2>
          <svg ref={svgRef} className="w-full" viewBox="0 0 800 400" />
        </div>
      </div>
    </div>
  );
}
