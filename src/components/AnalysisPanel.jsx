// src/components/AnalysisPanel.jsx
export default function AnalysisPanel({
  polygonStats,
  selectedPolygons,
  onClose,
}) {
  if (!polygonStats || polygonStats.length === 0) return null;

  // Filter to only show selected polygons
  const visiblePolygons = polygonStats.filter((_, index) => 
    selectedPolygons.includes(index)
  );

  if (visiblePolygons.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-slate-900">Selected Polygon</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" title="Close analysis">
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-500 italic text-center py-4">
          Click on a polygon to show its analysis
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto pr-1">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold text-slate-900">Selected Polygon</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700" title="Close analysis">
          ✕
        </button>
      </div>

      {visiblePolygons.map((poly) => {
        // Find original index for display numbering
        const originalIndex = polygonStats.findIndex(p => p === poly);
        
        return (
          <div
            key={originalIndex}
            className="mb-4 p-3 rounded border border-blue-300 bg-blue-50"
          >
            <div className="font-semibold mb-2">Polygon {originalIndex + 1}</div>

            {/* Area & Perimeter */}
            <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
              <div>
                Area:{" "}
                <span className="font-mono">{poly.areaKm2.toFixed(3)} km²</span>
              </div>
              <div>
                Perimeter:{" "}
                <span className="font-mono">
                  {poly.perimeterKm.toFixed(3)} km
                </span>
              </div>
            </div>

            {/* Flight Time Info */}
            {poly.flightSegments && poly.flightSegments.length > 0 ? (
              <div className="mt-2">
                <div className="font-medium text-sm mb-1">
                  Flight Segments Inside:
                </div>
                <div className="space-y-1">
                  {poly.flightSegments.map((seg, segIndex) => (
                    <div
                      key={segIndex}
                      className="text-xs bg-white p-2 rounded border border-blue-200"
                    >
                      <span className="font-mono">
                        {seg.start} → {seg.end}
                      </span>
                      <span className="ml-2 text-gray-600">
                        ({seg.duration} min)
                      </span>
                    </div>
                  ))}
                  <div className="text-sm font-semibold mt-1 pt-1 border-t border-gray-200">
                    Total time inside: {poly.totalMinutes} min
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No flight segments inside
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
