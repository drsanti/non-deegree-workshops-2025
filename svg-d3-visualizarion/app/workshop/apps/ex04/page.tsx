"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

// Generate Gaussian noise
function generateGaussianNoise(
  length: number,
  mean: number = 0,
  stdDev: number = 0.1
): number[] {
  const noise: number[] = [];
  for (let i = 0; i < length; i++) {
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

// Hook for signal generation
function useSignalGenerator(
  frequency: number,
  amplitude: number,
  phase: number,
  sampleRate: number,
  duration: number
) {
  return useMemo(() => {
    return generateSineWave(frequency, amplitude, phase, sampleRate, duration);
  }, [frequency, amplitude, phase, sampleRate, duration]);
}

// Hook for noise generation
function useNoiseGenerator(signal: DataPoint[], noiseLevel: number) {
  return useMemo(() => {
    return addNoiseToSignal(signal, noiseLevel);
  }, [signal, noiseLevel]);
}

function renderChart(
  svgRef: React.RefObject<SVGSVGElement | null>,
  cleanData: DataPoint[],
  noisyData: DataPoint[]
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

  const line = d3
    .line<DataPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  g.append("path")
    .datum(cleanData)
    .attr("fill", "none")
    .attr("stroke", "#3b82f6")
    .attr("stroke-width", 2)
    .attr("d", line);

  g.append("path")
    .datum(noisyData)
    .attr("fill", "none")
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7)
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

  const legend = g
    .append("g")
    .attr("transform", `translate(${chartWidth - 150}, 20)`);

  legend
    .append("line")
    .attr("x1", 0)
    .attr("x2", 30)
    .attr("y1", 0)
    .attr("y2", 0)
    .attr("stroke", "#3b82f6")
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

export default function Example04() {
  const [frequency, setFrequency] = useState(1);
  const [amplitude, setAmplitude] = useState(1);
  const [noiseLevel, setNoiseLevel] = useState(0.2);
  const svgRef = useRef<SVGSVGElement>(null);

  const cleanSignal = useSignalGenerator(frequency, amplitude, 0, 100, 2);
  const noisySignal = useNoiseGenerator(cleanSignal, noiseLevel);

  useEffect(() => {
    renderChart(svgRef, cleanSignal, noisySignal);
  }, [cleanSignal, noisySignal]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Example 04: Signal + Noise with Controls
          </h1>
          <p className="text-muted-foreground mt-2">
            Adjust signal parameters and noise level to see real-time changes
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Parameters</CardTitle>
              <CardDescription>
                Adjust signal and noise parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency (Hz)</Label>
                <Input
                  id="frequency"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amplitude">Amplitude</Label>
                <Input
                  id="amplitude"
                  type="number"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={amplitude}
                  onChange={(e) =>
                    setAmplitude(parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noiseLevel">Noise Level</Label>
                <Input
                  id="noiseLevel"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={noiseLevel}
                  onChange={(e) =>
                    setNoiseLevel(parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="pt-4 border-t space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Frequency: </span>
                  <span className="font-mono">{frequency.toFixed(2)} Hz</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Amplitude: </span>
                  <span className="font-mono">{amplitude.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Noise Level: </span>
                  <span className="font-mono">{noiseLevel.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Signal Visualization</CardTitle>
                <CardDescription>
                  Clean signal vs signal with noise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <svg ref={svgRef} className="w-full" viewBox="0 0 800 400" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
