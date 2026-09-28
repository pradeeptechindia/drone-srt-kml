// src/components/map/metrics.js
import area from "@turf/area";
import length from "@turf/length";
import { lineString, polygon } from "@turf/helpers";

export function getPolygonStats(latlngs) {
  if (!latlngs) return { areaKm2: 0, perimeterKm: 0 };

  // Normalize to array of rings
  let rings;
  if (latlngs[0] && Array.isArray(latlngs[0])) {
    // Already an array of rings
    rings = latlngs.map(ring =>
      ring.map((ll) => [ll.lng, ll.lat])
    );
  } else {
    // Single flat array, wrap it
    rings = [latlngs.map((ll) => [ll.lng, ll.lat])];
  }

  // Close the ring if first !== last
  rings = rings.map(ring => {
    if (ring.length < 3) return ring;
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([...first]);
    }
    return ring;
  });

  const turfPoly = polygon(rings);
  const polygonArea = area(turfPoly);
  const boundary = turfPoly.geometry.coordinates[0];
  const perimeter = length(lineString(boundary), { units: "kilometers" });

  return {
    areaKm2: polygonArea / 1_000_000,
    perimeterKm: perimeter,
  };
}

export function getLineDistanceKm(latlngs) {
  if (!latlngs || latlngs.length < 2) return 0;
  const turfLine = lineString(latlngs.map((ll) => [ll.lng, ll.lat]));
  return length(turfLine, { units: "kilometers" });
}

export function getMidPoint(latlngs) {
  if (!latlngs?.length) return null;
  const midIndex = Math.floor(latlngs.length / 2);
  return latlngs[midIndex] ?? latlngs[latlngs.length - 1];
}

export function formatPolygonLabel({ areaKm2, perimeterKm }) {
  return `Area: ${areaKm2.toFixed(3)} km²<br>Perim: ${perimeterKm.toFixed(3)} km`;
}

export function formatLineLabel(distanceKm) {
  return `${distanceKm.toFixed(3)} km`;
}

export function formatLiveLineDistance(distanceKm) {
  return `Distance: ${distanceKm.toFixed(2)} km`;
}

export function formatLivePolygonArea(areaKm2) {
  return `Area: ~${areaKm2.toFixed(3)} km²`;
}
