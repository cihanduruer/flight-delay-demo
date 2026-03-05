"use client";

import * as React from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";

// ---------- types ----------

interface AirportWithCoords {
  id: number;
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
}

interface DelayStats {
  probability: number;
  totalFlights: number;
  delayedFlights: number;
}

interface NearbyAirportDelay extends AirportWithCoords {
  delay: DelayStats;
}

export interface NearbyData {
  selected: AirportWithCoords;
  nearby: NearbyAirportDelay[];
}

interface DelayMapProps {
  data: NearbyData;
  /** delay stats for the selected airport itself (if available) */
  selectedDelay: DelayStats | null;
}

// ---------- color scale ----------

/**
 * Green → Yellow → Red continuous scale for probability 0 → 1.
 */
function delayColorScale(minP: number, maxP: number) {
  return d3
    .scaleSequential(d3.interpolateRgbBasis(["#22c55e", "#eab308", "#ef4444"]))
    .domain([minP, maxP]);
}

// ---------- component ----------

export function DelayMap({ data, selectedDelay }: DelayMapProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const width = 800;
  const height = 500;

  React.useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear for re-render

    // Resolve CSS custom properties from the computed style
    const computedStyle = getComputedStyle(document.documentElement);
    const cssVar = (name: string) =>
      computedStyle.getPropertyValue(name).trim();

    const bgColor = cssVar("--background") || "#ffffff";
    const mutedColor = cssVar("--muted") || "#f5f5f5";
    const borderColor = cssVar("--border") || "#e5e5e5";
    const fgColor = cssVar("--foreground") || "#171717";
    const primaryColor = cssVar("--primary") || "#171717";

    // Background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", bgColor)
      .attr("rx", 8);

    // Main group that will be transformed by zoom
    const g = svg.append("g");

    // ---------- Interactive zoom / pan / drag ----------
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 12])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Load US topology
    d3.json<Topology>("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(
      (us) => {
        if (!us) return;

        const states = feature(
          us,
          us.objects.states as GeometryCollection
        ) as FeatureCollection<Geometry>;

        const projection = d3.geoAlbersUsa().fitSize([width, height], states);
        const pathGen = d3.geoPath().projection(projection);

        // Draw states
        g.append("g")
          .attr("class", "states")
          .selectAll("path")
          .data(states.features)
          .join("path")
          .attr("d", pathGen as unknown as string)
          .attr("fill", mutedColor)
          .attr("stroke", borderColor)
          .attr("stroke-width", 0.5);

        // Compute color scale from all displayed airports
        const allProbs = data.nearby.map((a) => a.delay.probability);
        if (selectedDelay) allProbs.push(selectedDelay.probability);
        const minP = d3.min(allProbs) ?? 0;
        const maxP = d3.max(allProbs) ?? 1;
        const colorScale = delayColorScale(minP, maxP);

        // ---------- Zoom to bounding box (initial view) ----------
        const allPoints: [number, number][] = [
          [data.selected.lon, data.selected.lat],
          ...data.nearby.map(
            (a) => [a.lon, a.lat] as [number, number]
          ),
        ];

        const projectedPoints = allPoints
          .map((p) => projection(p))
          .filter((p): p is [number, number] => p != null);

        if (projectedPoints.length > 0) {
          const xs = projectedPoints.map((p) => p[0]);
          const ys = projectedPoints.map((p) => p[1]);
          const pad = 40;
          const x0 = d3.min(xs)! - pad;
          const y0 = d3.min(ys)! - pad;
          const x1 = d3.max(xs)! + pad;
          const y1 = d3.max(ys)! + pad;

          const bboxWidth = x1 - x0;
          const bboxHeight = y1 - y0;
          const scale = Math.min(
            width / bboxWidth,
            height / bboxHeight,
            4
          );
          const translateX = width / 2 - ((x0 + x1) / 2) * scale;
          const translateY = height / 2 - ((y0 + y1) / 2) * scale;

          const initialTransform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale);

          svg
            .transition()
            .duration(750)
            .call(zoom.transform, initialTransform);
        }

        // ---------- Draw nearby airport dots ----------
        const tooltip = d3.select(tooltipRef.current);

        const nearbyGroup = g.append("g").attr("class", "airports");

        // Nearby airports — circles
        nearbyGroup
          .selectAll("circle.nearby")
          .data(data.nearby)
          .join("circle")
          .attr("class", "nearby")
          .attr("cx", (d) => {
            const p = projection([d.lon, d.lat]);
            return p ? p[0] : 0;
          })
          .attr("cy", (d) => {
            const p = projection([d.lon, d.lat]);
            return p ? p[1] : 0;
          })
          .attr("r", 5)
          .attr("fill", (d) => colorScale(d.delay.probability))
          .attr("stroke", fgColor)
          .attr("stroke-width", 0.5)
          .attr("opacity", 0.9)
          .style("cursor", "pointer")
          .on("mouseenter", (_event, d) => {
            tooltip
              .style("opacity", 1)
              .html(
                `<strong>${d.name}</strong><br/>` +
                  `${d.city}, ${d.state}<br/>` +
                  `Delay: <strong>${(d.delay.probability * 100).toFixed(1)}%</strong><br/>` +
                  `Flights: ${d.delay.totalFlights.toLocaleString()} ` +
                  `(${d.delay.delayedFlights.toLocaleString()} delayed)`
              );
          })
          .on("mousemove", (event) => {
            const [mx, my] = d3.pointer(event, svgRef.current);
            tooltip
              .style("left", `${mx + 12}px`)
              .style("top", `${my - 10}px`);
          })
          .on("mouseleave", () => {
            tooltip.style("opacity", 0);
          });

        // ---------- Draw selected airport (star / larger circle) ----------
        const selProj = projection([
          data.selected.lon,
          data.selected.lat,
        ]);
        if (selProj) {
          nearbyGroup
            .append("circle")
            .attr("cx", selProj[0])
            .attr("cy", selProj[1])
            .attr("r", 7)
            .attr(
              "fill",
              selectedDelay
                ? colorScale(selectedDelay.probability)
                : primaryColor
            )
            .attr("stroke", fgColor)
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .on("mouseenter", () => {
              const probText = selectedDelay
                ? `Delay: <strong>${(selectedDelay.probability * 100).toFixed(1)}%</strong><br/>Flights: ${selectedDelay.totalFlights.toLocaleString()} (${selectedDelay.delayedFlights.toLocaleString()} delayed)`
                : "No delay data";
              tooltip
                .style("opacity", 1)
                .html(
                  `<strong>★ ${data.selected.name}</strong> (selected)<br/>` +
                    `${data.selected.city}, ${data.selected.state}<br/>` +
                    probText
                );
            })
            .on("mousemove", (event) => {
              const [mx, my] = d3.pointer(event, svgRef.current);
              tooltip
                .style("left", `${mx + 12}px`)
                .style("top", `${my - 10}px`);
            })
            .on("mouseleave", () => {
              tooltip.style("opacity", 0);
            });

          // Label for selected airport
          nearbyGroup
            .append("text")
            .attr("x", selProj[0])
            .attr("y", selProj[1] - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "4px")
            .attr("font-weight", "bold")
            .attr("fill", fgColor)
            .text(`★ ${data.selected.name}`);
        }
      }
    );

    // Cleanup: remove zoom listener on unmount
    return () => {
      svg.on(".zoom", null);
    };
  }, [data, selectedDelay]);

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto rounded-lg border border-border cursor-grab active:cursor-grabbing"
      />
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-popover text-popover-foreground border border-border rounded-md px-3 py-2 text-xs shadow-md"
        style={{ opacity: 0, transition: "opacity 0.15s" }}
      />
      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
        <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
        <span>Low delay</span>
        <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#eab308" }} />
        <span>Medium</span>
        <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
        <span>High delay</span>
        <span className="ml-3">★ = Selected airport</span>
      </div>
    </div>
  );
}
