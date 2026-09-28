// src/components/map/telemetry/trajectory.js
import { lineString } from "@turf/helpers";

export function buildFlightLine(points) {
  if (points.length < 2) return null;

  const coordinates = points.map(p => [p.lng, p.lat]);

  return lineString(coordinates, {
    timestamps: points.map(p => p.time)
  });
}