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

export default function Example01() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Generate signal with fixed parameters
    const frequency = 1; // Hz
    const amplitude = 1;
    const phase = 0;
    const sampleRate = 100; // samples per second
    const duration = 2; // seconds

    const data = generateSineWave(
      frequency,
      amplitude,
      phase,
      sampleRate,
      duration
    );

    // Setup D3 visualization
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

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d: DataPoint) => d.time) as [number, number])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d: DataPoint) => d.value) as [number, number])
      .range([chartHeight, 0])
      .nice();

    // Create line generator
    const line = d3
      .line<DataPoint>()
      .x((d: DataPoint) => xScale(d.time))
      .y((d: DataPoint) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add area under line
    const area = d3
      .area<DataPoint>()
      .x((d: DataPoint) => xScale(d.time))
      .y0(chartHeight)
      .y1((d: DataPoint) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "#3b82f6")
      .attr("fill-opacity", 0.1)
      .attr("d", area);

    // Add line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add x-axis
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const xAxisGroup = g
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis);

    // Style x-axis tick labels
    xAxisGroup
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "currentColor");

    // Add x-axis label
    xAxisGroup
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "500")
      .text("Time (s)");

    // Add y-axis
    const yAxis = d3.axisLeft(yScale).ticks(10);
    const yAxisGroup = g.append("g").call(yAxis);

    // Style y-axis tick labels
    yAxisGroup
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "currentColor");

    // Add y-axis label
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

    // Add grid lines
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
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Example 01: Basic Sine Wave
          </h1>
          <p className="text-muted-foreground mt-2">
            Simple signal generation and visualization with fixed parameters
            (frequency=1Hz, amplitude=1, duration=2s)
          </p>
        </header>

        <div className="bg-card rounded-lg border p-6">
          <svg ref={svgRef} className="w-full" viewBox="0 0 800 400" />
        </div>
      </div>
    </div>
  );
}
