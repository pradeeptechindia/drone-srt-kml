// src/components/map/telemetry/parseSRT.js
export function parseDroneSrt(text) {
  const lines = text.split("\n");

  const points = [];

  const latRegex = /\[latitude:\s*([-\d.]+)\]/;
  const lonRegex = /\[longitude:\s*([-\d.]+)\]/;
  const timeRegex = /(\d{2}):(\d{2}):(\d{2}),(\d{3})/;

  let currentTime = null;

  for (const line of lines) {

    // Extract timestamp from subtitle line
    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      const h = Number(timeMatch[1]);
      const m = Number(timeMatch[2]);
      const s = Number(timeMatch[3]);
      const ms = Number(timeMatch[4]);

      currentTime = h * 3600 + m * 60 + s + ms / 1000;
    }

    // Extract latitude / longitude
    const latMatch = line.match(latRegex);
    const lonMatch = line.match(lonRegex);

    if (latMatch && lonMatch && currentTime !== null) {
      const lat = parseFloat(latMatch[1]);
      const lng = parseFloat(lonMatch[1]);

      points.push({
        lat,
        lng,
        time: currentTime
      });
    }
  }

  return points.filter(p => !isNaN(p.lat) && !isNaN(p.lng));
}