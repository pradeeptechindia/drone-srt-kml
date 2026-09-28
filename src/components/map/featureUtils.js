// src/components/map/featureUtils.js
import L from "leaflet";

export const POLYGON_STYLE = {
  color: "#0077ff",
  weight: 2,
  fillColor: "#66b3ff",
  fillOpacity: 0.4,
};

export const LINE_STYLE = {
  color: "#ff0000",
  weight: 3,
};

export const POINT_STYLE = {
  radius: 6,
  color: "#008000",
  fillColor: "#00cc00",
  fillOpacity: 0.8,
};

export function styleFeatureLayer(featureLayer, geometryType) {
  if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
    featureLayer.setStyle(POLYGON_STYLE);
    return "polygon";
  }

  if (geometryType === "LineString" || geometryType === "MultiLineString") {
    featureLayer.setStyle(LINE_STYLE);
    return "line";
  }

  if (geometryType === "Point") {
    const latlng = featureLayer.getLatLng();
    const marker = L.circleMarker(latlng, POINT_STYLE);
    const name = featureLayer.feature?.properties?.name;

    if (name) marker.bindPopup(`Feature Name: ${name}`);

    return { kind: "point", layer: marker };
  }

  return null;
}

export function toGeoJsonFeature(layer, descriptionKey = "popupContent") {
  let geojson;

  if (typeof layer.toGeoJSON === "function") {
    geojson = layer.toGeoJSON();
  } else if (layer.feature) {
    geojson = { ...layer.feature };
    if (typeof layer.toGeoJSON === "function") {
      geojson.geometry = layer.toGeoJSON().geometry;
    }
  }

  if (!geojson || geojson.type !== "Feature" || !geojson.geometry) {
    return null;
  }

  geojson.properties = geojson.properties || {};
  if (layer.getPopup && layer.getPopup()) {
    geojson.properties[descriptionKey] = layer.getPopup().getContent();
  }

  if (layer.feature?.properties?.name) {
    geojson.properties.name = layer.feature.properties.name;
  }

  return geojson;
}

export function collectFeatures(layerGroups, descriptionKey = "popupContent") {
  const features = [];

  const collectFromLayer = (layer) => {
    const feature = toGeoJsonFeature(layer, descriptionKey);
    if (feature) features.push(feature);
  };

  layerGroups.forEach((group) => group.eachLayer(collectFromLayer));
  return features;
}

export function hasAnyContent(layerGroups) {
  return layerGroups.some((group) => group.getLayers().length > 0);
}

export function removeLabelsFromGroup(group, map) {
  group.eachLayer((layer) => {
    if (layer.label && map.hasLayer(layer.label)) {
      map.removeLayer(layer.label);
    }
  });
}
