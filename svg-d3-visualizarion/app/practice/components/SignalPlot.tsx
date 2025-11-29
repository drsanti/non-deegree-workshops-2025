"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  x: number;
  y: number;
}

type CurveType = "linear" | "step" | "monotone" | "basis" | "cardinal";

interface SignalPlotProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  xLabel?: string;
  yLabel?: string;
  curveType?: CurveType;
}

export default function SignalPlot({
  data,
  width = 800,
  height = 400,
  color = "#3b82f6",
  xLabel = "Sample Index",
  yLabel = "Amplitude",
  curveType = "linear",
}: SignalPlotProps) {
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

    // Convert array to data points with x (index) and y (value)
    const dataPoints: DataPoint[] = data.map((value, index) => ({
      x: index,
      y: value,
    }));

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d) as [number, number])
      .range([chartHeight, 0])
      .nice();

    // Map curve type to D3 curve function
    const curveMap: Record<CurveType, d3.CurveFactory> = {
      linear: d3.curveLinear,
      step: d3.curveStepAfter,
      monotone: d3.curveMonotoneX,
      basis: d3.curveBasis,
      cardinal: d3.curveCardinal,
    };

    // Create line generator
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(curveMap[curveType]);

    // Add grid lines
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

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

    // Add axes
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
      .text(xLabel);

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
      .text(yLabel);

    // Draw the line
    g.append("path")
      .datum(dataPoints)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line);
  }, [data, width, height, color, xLabel, yLabel, curveType]);

  return (
    <svg ref={svgRef} className="w-full" viewBox={`0 0 ${width} ${height}`} />
  );
}
