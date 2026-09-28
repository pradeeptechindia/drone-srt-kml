// src/components/MapView.jsx
import MapSidebar from "./MapSidebar";
import useMapController from "./map/useMapController";

export default function MapView() {
  const {
    mapRef,
    activeMapMode,
    hasData,
    exportEnabled,
    polygonAnalysisData,
    selectedPolygonIndices,
    showAnalysisPanel,
    setShowAnalysisPanel,
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
  } = useMapController();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100 lg:flex-row">
      <MapSidebar
        activeMapMode={activeMapMode}
        activeBaseLayer={activeBaseLayer}
        exportEnabled={exportEnabled}
        hasData={hasData}
        polygonAnalysisData={polygonAnalysisData}
        selectedPolygonIndices={selectedPolygonIndices}
        showAnalysisPanel={showAnalysisPanel}
        onBaseLayerChange={setActiveBaseLayer}
        onClear={handleClear}
        onCloseAnalysis={() => setShowAnalysisPanel(false)}
        onExport={handleExportGeoJson}
        onExportKML={handleExportKml}
        onKMLUpload={handleKMLUpload}
        onStartDrawing={startDrawing}
        onStopMapMode={stopMapMode}
        onToggleLines={toggleLines}
        onToggleMapMode={toggleMapMode}
        onTogglePoints={togglePoints}
        onTogglePolygons={togglePolygons}
      />

      <main className="relative min-h-0 min-w-0 flex-1 p-2">
        <div ref={mapRef} className="h-full w-full border-2 border-gray-200 rounded-lg" />
      </main>
    </div>
  );
}