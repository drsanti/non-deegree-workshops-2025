'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DashboardSensor } from '@/types/sensor';
import { createLinearScale, createValueAxis, getSensorColor } from '@/lib/d3-utils';

interface BarChartProps {
  data: DashboardSensor[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export default function BarChart({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 60, left: 60 },
}: BarChartProps) {
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
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.metadata.name))
      .range([0, chartWidth])
      .padding(0.2);

    const values = data.map((d) => d.currentValue);
    const maxValue = Math.max(...values, 0);
    const yScale = createLinearScale([0, maxValue], [chartHeight, 0], 0.1);

    // Create color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.metadata.type))
      .range(data.map((d) => getSensorColor(d.metadata.type)));

    // Add bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.metadata.name)!)
      .attr('y', (d) => yScale(d.currentValue))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => chartHeight - yScale(d.currentValue))
      .attr('fill', (d) => colorScale(d.metadata.type))
      .attr('opacity', 0.8)
      .attr('rx', 4);

    // Add value labels on bars
    g.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d.metadata.name)! + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.currentValue) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text((d) => d.currentValue.toFixed(1));

    // Add x-axis
    const xAxis = d3.axisBottom(xScale);
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
      .call(
        yAxis
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.2);
  }, [data, width, height, margin]);

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

