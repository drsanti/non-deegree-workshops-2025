/**
 * D3.js utility functions for IoT sensor visualizations
 */

import * as d3 from 'd3';
import type { SensorDataPoint } from '@/types/sensor';

/**
 * Create a time scale for x-axis
 */
export function createTimeScale(
  domain: Date[],
  range: [number, number]
): d3.ScaleTime<number, number> {
  return d3.scaleTime().domain(domain).range(range);
}

/**
 * Create a linear scale for y-axis
 */
export function createLinearScale(
  domain: [number, number],
  range: [number, number],
  padding: number = 0.1
): d3.ScaleLinear<number, number> {
  const [min, max] = domain;
  const paddingAmount = (max - min) * padding;
  return d3
    .scaleLinear()
    .domain([min - paddingAmount, max + paddingAmount])
    .range(range);
}

/**
 * Create a line generator for time series data
 */
export function createLineGenerator(
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>
): d3.Line<SensorDataPoint> {
  return d3
    .line<SensorDataPoint>()
    .x((d) => xScale(d.timestamp))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);
}

/**
 * Create an area generator for filled area charts
 */
export function createAreaGenerator(
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  y0: number
): d3.Area<SensorDataPoint> {
  return d3
    .area<SensorDataPoint>()
    .x((d) => xScale(d.timestamp))
    .y0(y0)
    .y1((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  return d3.timeFormat('%H:%M')(date);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return d3.timeFormat('%b %d, %Y')(date);
}

/**
 * Format value with unit
 */
export function formatValue(value: number, unit: string, decimals: number = 1): string {
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Get domain from time series data
 */
export function getTimeDomain(data: SensorDataPoint[]): Date[] {
  if (data.length === 0) {
    const now = new Date();
    return [now, now];
  }
  const timestamps = data.map((d) => d.timestamp);
  return [d3.min(timestamps)!, d3.max(timestamps)!];
}

/**
 * Get value domain from time series data with padding
 */
export function getValueDomain(data: SensorDataPoint[], padding: number = 0.1): [number, number] {
  if (data.length === 0) {
    return [0, 100];
  }
  const values = data.map((d) => d.value);
  const min = d3.min(values)!;
  const max = d3.max(values)!;
  const paddingAmount = (max - min) * padding;
  return [min - paddingAmount, max + paddingAmount];
}

/**
 * Create x-axis with time formatting
 */
export function createTimeAxis(
  scale: d3.ScaleTime<number, number>,
  ticks: number = 5
): d3.Axis<Date> {
  return d3.axisBottom(scale).ticks(ticks).tickFormat(d3.timeFormat('%H:%M') as any);
}

/**
 * Create y-axis with number formatting
 */
export function createValueAxis(
  scale: d3.ScaleLinear<number, number>,
  ticks: number = 5
): d3.Axis<number> {
  return d3.axisLeft(scale).ticks(ticks);
}

/**
 * Create color scale for sensor types
 */
export function createSensorColorScale(): d3.ScaleOrdinal<string, string> {
  return d3
    .scaleOrdinal<string>()
    .domain(['temperature', 'humidity', 'pressure', 'light', 'motion', 'air_quality'])
    .range([
      '#ef4444', // red for temperature
      '#3b82f6', // blue for humidity
      '#8b5cf6', // purple for pressure
      '#f59e0b', // amber for light
      '#10b981', // green for motion
      '#06b6d4', // cyan for air quality
    ]);
}

/**
 * Get color for sensor type
 */
export function getSensorColor(type: string): string {
  const scale = createSensorColorScale();
  return scale(type) || '#6b7280';
}

