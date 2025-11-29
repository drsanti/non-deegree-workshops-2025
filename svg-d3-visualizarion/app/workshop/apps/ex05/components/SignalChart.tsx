"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { DataPoint } from "../lib/types";

interface SignalChartProps {
  cleanData: DataPoint[];
  noisyData: DataPoint[];
  color: string;
  width?: number;
  height?: number;
}

export default function SignalChart({
  cleanData,
  noisyData,
  color,
  width = 1000,
  height = 400,
}: SignalChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

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
      .domain(d3.extent(allData, (d: DataPoint) => d.time) as [number, number])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(allData, (d: DataPoint) => d.value) as [number, number])
      .range([chartHeight, 0])
      .nice();

    const line = d3
      .line<DataPoint>()
      .x((d: DataPoint) => xScale(d.time))
      .y((d: DataPoint) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const area = d3
      .area<DataPoint>()
      .x((d: DataPoint) => xScale(d.time))
      .y0(chartHeight)
      .y1((d: DataPoint) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(cleanData)
      .attr("fill", color)
      .attr("fill-opacity", 0.1)
      .attr("d", area);

    g.append("path")
      .datum(cleanData)
      .attr("fill", "none")
      .attr("stroke", color)
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
  }, [cleanData, noisyData, color, width, height]);

  return (
    <svg ref={svgRef} className="w-full" viewBox={`0 0 ${width} ${height}`} />
  );
}
