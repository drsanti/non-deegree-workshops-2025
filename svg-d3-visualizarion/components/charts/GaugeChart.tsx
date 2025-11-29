'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getSensorColor } from '@/lib/d3-utils';

interface GaugeChartProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  sensorType: string;
  width?: number;
  height?: number;
  label?: string;
}

export default function GaugeChart({
  value,
  min,
  max,
  unit,
  sensorType,
  width = 300,
  height = 300,
  label,
}: GaugeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2 - 20;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append('g').attr('transform', `translate(${centerX},${centerY})`);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<number>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    // Background arc (full semicircle)
    const backgroundArc = d3
      .arc<d3.PieArcDatum<number>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    // Draw background arc
    g.append('path')
      .datum({ startAngle: -Math.PI / 2, endAngle: Math.PI / 2 })
      .attr('d', backgroundArc as any)
      .attr('fill', '#e5e7eb')
      .attr('opacity', 0.3);

    // Calculate value angle
    const normalizedValue = (value - min) / (max - min);
    const valueAngle = -Math.PI / 2 + normalizedValue * Math.PI;

    // Draw value arc
    const valueArc = d3
      .arc<d3.PieArcDatum<number>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(valueAngle);

    const color = getSensorColor(sensorType);

    g.append('path')
      .datum({ startAngle: -Math.PI / 2, endAngle: valueAngle })
      .attr('d', valueArc as any)
      .attr('fill', color)
      .attr('opacity', 0.8);

    // Add value text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-10')
      .attr('font-size', '32px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
      .text(`${value.toFixed(1)}`);

    // Add unit text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '15')
      .attr('font-size', '14px')
      .attr('fill', '#6b7280')
      .text(unit);

    // Add label if provided
    if (label) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '35')
        .attr('font-size', '12px')
        .attr('fill', '#9ca3af')
        .text(label);
    }

    // Add min/max labels
    g.append('text')
      .attr('x', -radius - 10)
      .attr('y', radius * 0.3)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', '#9ca3af')
      .text(min.toString());

    g.append('text')
      .attr('x', radius + 10)
      .attr('y', radius * 0.3)
      .attr('text-anchor', 'start')
      .attr('font-size', '10px')
      .attr('fill', '#9ca3af')
      .text(max.toString());
  }, [value, min, max, unit, sensorType, width, height, label]);

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

