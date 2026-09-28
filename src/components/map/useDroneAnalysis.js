// src/components/map/useDroneAnalysis.js
import { useCallback, useRef, useState } from "react";
import L from "leaflet";
import { getPolygonStats } from "./metrics";
import { parseDroneSrt } from "./telemetry/parseSRT";
import { buildFlightLine } from "./telemetry/trajectory";
import { formatTime } from "./telemetry/timeUtils";
import { splitTrajectoryByPolygon } from "./telemetry/splitTrajectoryByPolygon";

export default function useDroneAnalysis(mapInstanceRef, polygonLayerRef) {
  const droneTrajectory = useRef(null);
  const segmentLayersRef = useRef([]);
  const polygonInstances = useRef([]);

  const [polygonAnalysisData, setPolygonAnalysisData] = useState([]);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [selectedPolygonIndices, setSelectedPolygonIndices] = useState([]);

  const analyzeDroneVsPolygons = useCallback(() => {
    const map = mapInstanceRef.current;
    const trajectory = droneTrajectory.current;
    if (!map || !trajectory) return;

    const points = trajectory.points;
    if (!points.length) return;

    if (segmentLayersRef.current) {
      segmentLayersRef.current.forEach((layer) => map.removeLayer(layer));
    }
    segmentLayersRef.current = [];

    const analysisResults = [];
    const instances = [];

    polygonLayerRef.current.eachLayer((poly) => {
      instances.push(poly);

      const geoJson = poly.toGeoJSON();
      const segments = splitTrajectoryByPolygon(points, geoJson);

      const latlngs = poly.getLatLngs();
      const flat = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
      const stats = getPolygonStats(flat);

      if (poly.timeLabel) {
        map.removeLayer(poly.timeLabel);
        poly.timeLabel = null;
      }

      const data = {
        areaKm2: stats.areaKm2,
        perimeterKm: stats.perimeterKm,
        flightSegments: [],
        totalMinutes: "0.0",
      };

      if (segments.length > 0) {
        let totalTime = 0;

        segments.forEach((seg) => {
          const start = seg[0].time;
          const end = seg[seg.length - 1].time;
          const duration = end - start;
          totalTime += duration;

          data.flightSegments.push({
            start: formatTime(start),
            end: formatTime(end),
            duration: (duration / 60).toFixed(1),
          });

          const coords = seg.map((p) => [p.lat, p.lng]);
          const layer = L.polyline(coords, { color: "#00cc66", weight: 4 });
          map.addLayer(layer);
          segmentLayersRef.current.push(layer);
        });

        data.totalMinutes = (totalTime / 60).toFixed(1);
      }

      analysisResults.push(data);
    });

    polygonInstances.current = instances;
    setPolygonAnalysisData(analysisResults);
    setSelectedPolygonIndices([]);
    setShowAnalysisPanel(analysisResults.length > 0);
  }, [mapInstanceRef, polygonLayerRef]);

  const handleTogglePolygon = useCallback((index) => {
    setSelectedPolygonIndices((prev) => {
      const next = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort();

      polygonInstances.current.forEach((layer, i) => {
        if (i === index) {
          layer.setStyle(
            next.includes(index)
              ? { weight: 4, color: "#ffaa00" }
              : { weight: 2, color: "#0077ff" }
          );
        }
      });

      return next;
    });
  }, []);

  const processSrtFile = useCallback(
    (text) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const points = parseDroneSrt(text);
      const line = buildFlightLine(points);

      if (!line) {
        alert("Invalid telemetry file.");
        return;
      }

      const coords = line.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const flightLayer = L.polyline(coords, { color: "#ff8800", weight: 3 });

      map.addLayer(flightLayer);

      droneTrajectory.current = { points, geojson: line, layer: flightLayer };

      analyzeDroneVsPolygons();

      if (coords.length) map.fitBounds(flightLayer.getBounds());
    },
    [mapInstanceRef, analyzeDroneVsPolygons]
  );

  const clearDroneData = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (droneTrajectory.current?.layer) {
      map.removeLayer(droneTrajectory.current.layer);
      droneTrajectory.current = null;
    }

    segmentLayersRef.current.forEach((layer) => map.removeLayer(layer));
    segmentLayersRef.current = [];

    setSelectedPolygonIndices([]);
    polygonInstances.current = [];
  }, [mapInstanceRef]);

  return {
    polygonInstances,
    polygonAnalysisData,
    selectedPolygonIndices,
    showAnalysisPanel,
    setShowAnalysisPanel,
    handleTogglePolygon,
    analyzeDroneVsPolygons,
    processSrtFile,
    clearDroneData,
  };
}