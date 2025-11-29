'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SignalDataPoint } from '@/types/signal';
import type { SignalType } from '@/types/signal';
import {
  createLinearScale,
  createValueAxis,
  getSensorColor,
} from '@/lib/d3-utils';

interface SignalChartProps {
  data: SignalDataPoint[];
  signalType: SignalType;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  color?: string;
}

export default function SignalChart({
  data,
  signalType,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  color,
}: SignalChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const timeDomain = d3.extent(data, (d) => d.time) as [number, number];
    const valueDomain = d3.extent(data, (d) => d.value) as [number, number];
    
    const xScale = d3.scaleLinear().domain(timeDomain).range([0, chartWidth]);
    const yScale = createLinearScale(valueDomain, [chartHeight, 0], 0.1);

    // Create line generator
    const line = d3
      .line<SignalDataPoint>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const lineColor = color || getSensorColor(signalType);

    // Add area under line
    const area = d3
      .area<SignalDataPoint>()
      .x((d) => xScale(d.time))
      .y0(chartHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', lineColor)
      .attr('fill-opacity', 0.1)
      .attr('d', area);

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots for key points (sample every nth point for performance)
    const sampleRate = Math.max(1, Math.floor(data.length / 100));
    g.selectAll('circle')
      .data(data.filter((_, i) => i % sampleRate === 0))
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.time))
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 2)
      .attr('fill', lineColor)
      .attr('opacity', 0.6);

    // Add x-axis
    const xAxis = d3.axisBottom(xScale).ticks(10);
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .append('text')
      .attr('x', chartWidth / 2)
      .attr('y', 35)
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .text('Time (s)');

    // Add y-axis
    const yAxis = createValueAxis(yScale, 10);
    g.append('g').call(yAxis).append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -chartHeight / 2)
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .text('Amplitude');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        xAxis
          .tickSize(-chartHeight)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.2);

    g.append('g')
      .attr('class', 'grid')
      .call(
        yAxis
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.2);

    // Add zero line
    if (valueDomain[0] < 0 && valueDomain[1] > 0) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', yScale(0))
        .attr('y2', yScale(0))
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.5);
    }
  }, [data, signalType, width, height, margin, color]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

