// src/components/map/useMapController.js
import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import omnivore from "leaflet-omnivore";
import tokml from "tokml";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import {
  collectFeatures,
  hasAnyContent,
  LINE_STYLE,
  POLYGON_STYLE,
  removeLabelsFromGroup,
  styleFeatureLayer,
} from "./featureUtils";
import {
  formatLineLabel,
  formatLiveLineDistance,
  formatLivePolygonArea,
  formatPolygonLabel,
  getLineDistanceKm,
  getMidPoint,
  getPolygonStats,
} from "./metrics";
import useDroneAnalysis from "./useDroneAnalysis";
import "leaflet-measure";
import "leaflet-measure/dist/leaflet-measure.css";

const DEFAULT_CENTER = [22.619, 88.4611];
const DEFAULT_ZOOM = 18;

const TILE_LAYERS = {
  google: L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "© Google",
  }),
  osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }),
};

// Fix leaflet-measure offset issue
L.Control.Measure.include({
  _setCaptureMarkerIcon: function () {
    if (this._captureMarker) {
      this._captureMarker.options.autoPanOnFocus = false;
    }
    this._captureMarker.setIcon(
      L.divIcon({
        iconSize: this._map.getSize().multiplyBy(2),
      })
    );
  },
});

// Fix measurement display
L.Control.Measure.include({
  _formatDistance: function (meters) {
    const m = parseFloat(meters);
    if (isNaN(m)) return "";
    if (m < 1000) {
      return m.toFixed(2) + ' m';
    } else {
      return (m / 1000).toFixed(2) + ' km';
    }
  },
  _formatArea: function (sqMeters) {
    const sqm = parseFloat(sqMeters);
    if (isNaN(sqm)) return "";
    if (sqm < 10000) {
      return sqm.toFixed(2) + ' m²';
    } else {
      return (sqm / 1000000).toFixed(2) + ' km²';
    }
  }
});

function createPersistentLabel(options) {
  return L.tooltip({ permanent: true, opacity: 0.9, ...options });
}

export default function useMapController() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const baseLayerRef = useRef(null);

  const polygonLayer = useRef(L.layerGroup());
  const lineLayer = useRef(L.layerGroup());
  const pointLayer = useRef(L.layerGroup());

  const [hasData, setHasData] = useState(false);
  const [exportEnabled, setExportEnabled] = useState(false);
  const hasDataRef = useRef(false);

  const [activeBaseLayer, setActiveBaseLayer] = useState("google");
  const [activeMapMode, setActiveMapMode] = useState(null);

  const {
    polygonInstances,
    polygonAnalysisData,
    selectedPolygonIndices,
    showAnalysisPanel,
    setShowAnalysisPanel,
    handleTogglePolygon,
    analyzeDroneVsPolygons,
    processSrtFile,
    clearDroneData,
  } = useDroneAnalysis(mapInstance, polygonLayer);

  const getLayerGroups = useCallback(
    () => [polygonLayer.current, lineLayer.current, pointLayer.current],
    []
  );

  const syncUiState = useCallback(() => {
    const has = hasAnyContent(getLayerGroups());
    if (has === hasDataRef.current) return;
    hasDataRef.current = has;
    setHasData(has);
    setExportEnabled(has);
  }, [getLayerGroups]);

  const stopMapMode = useCallback(() => {
    const map = mapInstance.current;
    if (!map?.pm) return;
    map.pm.disableDraw();
    map.pm.disableGlobalEditMode();
    map.pm.disableGlobalDragMode();
    map.pm.disableGlobalRemovalMode();
    map.pm.disableGlobalCutMode();
    setActiveMapMode(null);
  }, []);

  const startDrawing = useCallback(
    (shape) => {
      const map = mapInstance.current;
      if (!map?.pm) return;
      stopMapMode();
      map.pm.enableDraw(shape);
      setActiveMapMode(shape);
    },
    [stopMapMode]
  );

  const toggleMapMode = useCallback(
    (mode) => {
      const map = mapInstance.current;
      if (!map?.pm) return;
      if (activeMapMode === mode) {
        stopMapMode();
        return;
      }
      stopMapMode();
      if (mode === "edit") map.pm.enableGlobalEditMode();
      if (mode === "drag") map.pm.enableGlobalDragMode();
      if (mode === "remove") map.pm.enableGlobalRemovalMode();
      if (mode === "cut") map.pm.enableGlobalCutMode();
      setActiveMapMode(mode);
    },
    [activeMapMode, stopMapMode]
  );

  const updateLabel = useCallback((layer) => {
    if (!layer.label) return;
    const latlngs = layer.getLatLngs();
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      const stats = getPolygonStats(latlngs);
      layer.label.setContent(formatPolygonLabel(stats));
      layer.label.setLatLng(layer.getBounds().getCenter());
      return;
    }
    if (layer instanceof L.Polyline) {
      const dist = getLineDistanceKm(latlngs);
      const mid = getMidPoint(latlngs);
      if (mid) {
        layer.label.setLatLng(mid);
        layer.label.setContent(formatLineLabel(dist));
      }
    }
  }, []);

  // --- Map initialization ---
  useEffect(() => {
    if (mapInstance.current) return;

    const map = L.map(mapRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    getLayerGroups().forEach((group) => map.addLayer(group));

    // Add initial base layer
    const initialLayer = TILE_LAYERS[activeBaseLayer] || TILE_LAYERS.google;
    initialLayer.addTo(map);
    baseLayerRef.current = initialLayer;

    map.pm.setGlobalOptions({
      snapDistance: 20,
      allowSelfIntersection: false,
      exitModeOnEscape: true,
      finishOnEnter: true,
    });

    const handleCreate = (e) => {
      const layer = e.layer;
      const type = e.shape;

      if (type === "Polygon" || type === "Rectangle") {
        layer.setStyle(POLYGON_STYLE);
        polygonLayer.current.addLayer(layer);

        const center = layer.getBounds().getCenter();
        const latlngs = layer.getLatLngs();
        const flat = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
        const stats = getPolygonStats(flat);

        const label = createPersistentLabel({
          direction: "center",
          className:
            "permanent-label bg-white px-2 py-1 rounded shadow text-xs text-center pointer-events-none",
          offset: [0, 0],
        })
          .setLatLng(center)
          .setContent(formatPolygonLabel(stats))
          .addTo(map);

        layer.label = label;

        layer.on("click", () => {
          const idx = polygonInstances.current.findIndex((inst) => inst === layer);
          if (idx !== -1) handleTogglePolygon(idx);
        });

        polygonInstances.current.push(layer);
        analyzeDroneVsPolygons();

        layer.on("pm:edit", () => {
          updateLabel(layer);
          analyzeDroneVsPolygons();
        });

        layer.on("pm:remove", () => {
          if (layer.label) map.removeLayer(layer.label);
          syncUiState();
        });

      } else if (type === "Line" || type === "Polyline") {
        layer.setStyle(LINE_STYLE);
        lineLayer.current.addLayer(layer);

        const latlngs = layer.getLatLngs();
        const dist = getLineDistanceKm(latlngs);
        const mid = getMidPoint(latlngs);

        if (mid) {
          const label = createPersistentLabel({
            direction: "top",
            className:
              "permanent-label bg-white px-2 py-1 rounded shadow text-xs pointer-events-none",
            offset: [0, -15],
          })
            .setLatLng(mid)
            .setContent(formatLineLabel(dist))
            .addTo(map);

          layer.label = label;
        }

        layer.on("pm:edit", () => updateLabel(layer));
        layer.on("pm:remove", () => {
          if (layer.label) map.removeLayer(layer.label);
          syncUiState();
        });
      }

      syncUiState();
    };

    let currentTooltip = null;

    const handleDrawStart = ({ workingLayer, shape }) => {
      if (currentTooltip) map.removeLayer(currentTooltip);

      currentTooltip = L.tooltip({
        permanent: true,
        direction: "top",
        offset: [0, -10],
        opacity: 0.9,
      })
        .setLatLng([0, 0])
        .addTo(map);

      workingLayer.on("pm:change", () => {
        const latlngs = workingLayer.getLatLngs();
        let content = "";

        if ((shape === "Polyline" || shape === "Line") && latlngs.length >= 2) {
          content = formatLiveLineDistance(getLineDistanceKm(latlngs));
        } else if ((shape === "Polygon" || shape === "Rectangle") && latlngs.length >= 3) {
          content = formatLivePolygonArea(getPolygonStats(latlngs).areaKm2);
        }

        if (content) {
          currentTooltip.setLatLng(latlngs[latlngs.length - 1]).setContent(content);
        }
      });
    };

    const clearDrawTooltip = () => {
      if (!currentTooltip) return;
      map.removeLayer(currentTooltip);
      currentTooltip = null;
    };

    const clearActiveMode = () => setActiveMapMode(null);
    const syncAfterRemove = () => syncUiState();

    map.on("pm:create", handleCreate);
    map.on("pm:drawstart", handleDrawStart);
    map.on("pm:drawend", clearDrawTooltip);
    map.on("pm:cancel", clearDrawTooltip);
    map.on("pm:globaleditmodetoggled", ({ enabled }) => {
      setActiveMapMode(enabled ? "edit" : null);
    });
    map.on("pm:globaldragmodetoggled", ({ enabled }) => {
      setActiveMapMode(enabled ? "drag" : null);
    });
    map.on("pm:globalremovalmodetoggled", ({ enabled }) => {
      setActiveMapMode(enabled ? "remove" : null);
    });
    map.on("pm:globalcutmodetoggled", ({ enabled }) => {
      setActiveMapMode(enabled ? "cut" : null);
    });
    map.on("pm:drawend", clearActiveMode);
    map.on("pm:cancel", clearActiveMode);
    map.on("pm:remove", syncAfterRemove);

    mapInstance.current = map;

    const measureControl = L.control.measure({
      position: 'topright',
      primaryLengthUnit: 'meters',
      secondaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters',
      secondaryAreaUnit: 'sqkilometers',
      activeColor: '#db4a29',
      completedColor: '#9b2d14',
      decPoint: '.',
      thousandsSep: ',',
      units: {
        meters: { factor: 1, display: 'meters', decimals: 2 },
        sqmeters: { factor: 1, display: 'sqmeters', decimals: 2 }
      }
    });

    measureControl.addTo(map);

    return () => {
      map.off("pm:create", handleCreate);
      map.off("pm:drawstart", handleDrawStart);
      map.off("pm:drawend", clearDrawTooltip);
      map.off("pm:cancel", clearDrawTooltip);
      map.off("pm:drawend", clearActiveMode);
      map.off("pm:cancel", clearActiveMode);
      map.off("pm:remove", syncAfterRemove);
      clearDrawTooltip();
      map.remove();
      mapInstance.current = null;
    };
  }, [getLayerGroups, syncUiState, updateLabel, handleTogglePolygon, analyzeDroneVsPolygons, polygonInstances]);

  // --- Base layer switching ---
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove current base layer
    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }

    // Add new base layer
    const layer = TILE_LAYERS[activeBaseLayer];
    if (layer) {
      layer.addTo(map);
      baseLayerRef.current = layer;
    }
  }, [activeBaseLayer]);

  // --- File uploads ---

  const handleKMLUpload = useCallback(
    (event) => {
      const files = event.target.files;
      if (!files?.length) return;
      const map = mapInstance.current;
      if (!map) return;

      Array.from(files).forEach((file) => {
        if (file.name.toLowerCase().endsWith(".srt")) {
          const reader = new FileReader();
          reader.onload = (e) => processSrtFile(e.target.result);
          reader.readAsText(file);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const blob = new Blob([e.target.result], { type: "text/xml" });
          const url = URL.createObjectURL(blob);
          const rawLayer = omnivore.kml(url).addTo(map);

          rawLayer.on("ready", () => {
            const polygons = [];
            const lines = [];
            const points = [];

            rawLayer.eachLayer((featureLayer) => {
              const geometryType = featureLayer.feature?.geometry?.type;
              const styled = styleFeatureLayer(featureLayer, geometryType);

              if (styled === "polygon") polygons.push(featureLayer);
              if (styled === "line") lines.push(featureLayer);
              if (styled?.kind === "point") points.push(styled.layer);
            });

            map.removeLayer(rawLayer);

            polygons.forEach((layer) => {
              polygonLayer.current.addLayer(layer);

              layer.on("click", () => {
                const idx = polygonInstances.current.findIndex((inst) => inst === layer);
                if (idx !== -1) handleTogglePolygon(idx);
              });

              polygonInstances.current.push(layer);
            });

            analyzeDroneVsPolygons();

            lines.forEach((layer) => lineLayer.current.addLayer(layer));
            points.forEach((layer) => pointLayer.current.addLayer(layer));

            const bounds = rawLayer.getBounds();
            if (bounds?.isValid()) map.fitBounds(bounds);

            URL.revokeObjectURL(url);
            syncUiState();
          });
        };
        reader.readAsText(file);
      });

      event.target.value = "";
    },
    [syncUiState, handleTogglePolygon, analyzeDroneVsPolygons, processSrtFile, polygonInstances]
  );

  // --- Exports ---

  const handleExportGeoJson = useCallback(() => {
    const features = collectFeatures(getLayerGroups(), "popupContent");
    if (!features.length) {
      alert("No features to export.");
      return;
    }
    const blob = new Blob(
      [JSON.stringify({ type: "FeatureCollection", features }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `map_export_${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getLayerGroups]);

  const handleExportKml = useCallback(() => {
    const features = collectFeatures(getLayerGroups(), "description");
    if (!features.length) {
      alert("No features to export as KML.");
      return;
    }
    let kmlString;
    try {
      kmlString = tokml(
        { type: "FeatureCollection", features },
        {
          name: "name",
          description: "description",
          documentName: "Exported Map Features",
          documentDescription: "From custom Leaflet KML viewer",
        }
      );
    } catch {
      alert("Failed to generate KML. Check console.");
      return;
    }
    const blob = new Blob([kmlString], {
      type: "application/vnd.google-earth.kml+xml",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `map_export_${new Date().toISOString().slice(0, 10)}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getLayerGroups]);

  // --- Clear ---

  const handleClear = useCallback(() => {
    if (!window.confirm("Remove all features from the map? This cannot be undone.")) return;

    const map = mapInstance.current;
    if (!map) return;

    removeLabelsFromGroup(polygonLayer.current, map);
    removeLabelsFromGroup(lineLayer.current, map);

    polygonLayer.current.clearLayers();
    lineLayer.current.clearLayers();
    pointLayer.current.clearLayers();

    clearDroneData();
    syncUiState();
  }, [syncUiState, clearDroneData]);

  // --- Layer toggles ---

  const togglePolygons = useCallback(
    (checked) => {
      const map = mapInstance.current;
      if (!map) return;
      checked ? map.addLayer(polygonLayer.current) : map.removeLayer(polygonLayer.current);
    },
    []
  );

  const toggleLines = useCallback(
    (checked) => {
      const map = mapInstance.current;
      if (!map) return;
      checked ? map.addLayer(lineLayer.current) : map.removeLayer(lineLayer.current);
    },
    []
  );

  const togglePoints = useCallback(
    (checked) => {
      const map = mapInstance.current;
      if (!map) return;
      checked ? map.addLayer(pointLayer.current) : map.removeLayer(pointLayer.current);
    },
    []
  );

  return {
    mapRef,
    activeMapMode,
    hasData,
    exportEnabled,
    polygonAnalysisData,
    selectedPolygonIndices,
    showAnalysisPanel,
    setShowAnalysisPanel,
    handleTogglePolygon,
    handleKMLUpload,
    handleExportGeoJson,
    handleExportKml,
    handleClear,
    togglePolygons,
    toggleLines,
    togglePoints,
    activeBaseLayer,
    setActiveBaseLayer,
    startDrawing,
    toggleMapMode,
    stopMapMode,
  };
}