'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SensorDataPoint } from '@/types/sensor';
import {
  createTimeScale,
  createLinearScale,
  createLineGenerator,
  getTimeDomain,
  getValueDomain,
  createTimeAxis,
  createValueAxis,
  getSensorColor,
} from '@/lib/d3-utils';

interface LineChartProps {
  data: SensorDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  color?: string;
  sensorType?: string;
}

export default function LineChart({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  color,
  sensorType,
}: LineChartProps) {
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
    const timeDomain = getTimeDomain(data);
    const valueDomain = getValueDomain(data);
    const xScale = createTimeScale(timeDomain, [0, chartWidth]);
    const yScale = createLinearScale(valueDomain, [chartHeight, 0]);

    // Create line generator
    const line = createLineGenerator(xScale, yScale);
    const lineColor = color || (sensorType ? getSensorColor(sensorType) : '#3b82f6');

    // Add area under line
    const area = d3
      .area<SensorDataPoint>()
      .x((d) => xScale(d.timestamp))
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

    // Add dots
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.timestamp))
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 3)
      .attr('fill', lineColor)
      .attr('opacity', 0.6);

    // Add x-axis
    const xAxis = createTimeAxis(xScale, 5);
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Add y-axis
    const yAxis = createValueAxis(yScale, 5);
    g.append('g').call(yAxis);

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
  }, [data, width, height, margin, color, sensorType]);

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

