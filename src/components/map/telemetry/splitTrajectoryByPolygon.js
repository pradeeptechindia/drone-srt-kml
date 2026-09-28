// src/components/map/telemetry/splitTrajectoryByPolygon.js
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

export function splitTrajectoryByPolygon(points, polygonGeoJson) {
  const segments = [];
  let currentSegment = [];

  for (const p of points) {
    const pt = { type: "Point", coordinates: [p.lng, p.lat] };
    if (booleanPointInPolygon(pt, polygonGeoJson)) {
      currentSegment.push(p);
    } else if (currentSegment.length > 1) {
      segments.push(currentSegment);
      currentSegment = [];
    }
  }

  if (currentSegment.length > 1) segments.push(currentSegment);
  return segments;
}