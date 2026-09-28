// src/components/MapSidebar.jsx
import AnalysisPanel from "./AnalysisPanel";
import LayerControls from "./LayerControls";
import Legend from "./Legend";
import UploadPanel from "./UploadPanel";
import BaseLayerControls from "./map/BaseLayerControls";
import DrawingControls from "./map/DrawingControls";
import MapActionsPanel from "./map/MapActionsPanel";
import SidebarSection from "./SidebarSection";

export default function MapSidebar({
  activeMapMode,
  activeBaseLayer,
  exportEnabled,
  hasData,
  polygonAnalysisData,
  selectedPolygonIndices,
  showAnalysisPanel,
  onBaseLayerChange,
  onClear,
  onCloseAnalysis,
  onExport,
  onExportKML,
  onKMLUpload,
  onStartDrawing,
  onStopMapMode,
  onToggleLines,
  onToggleMapMode,
  onTogglePoints,
  onTogglePolygons,
}) {
  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-slate-200 bg-slate-50 lg:w-[400px] xl:w-[440px]">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <h1 className="text-lg font-semibold text-slate-900">KML Mapping Workspace</h1>
        <p className="mt-1 text-sm text-slate-500">
            Upload KML, draw, analyze drone telemetry, and export.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">

        <SidebarSection title="Base Layer">
          <BaseLayerControls
            activeBaseLayer={activeBaseLayer}
            onBaseLayerChange={onBaseLayerChange}
          />
        </SidebarSection>

        <SidebarSection title="Files">
          <UploadPanel onUpload={onKMLUpload} />
        </SidebarSection>

        <SidebarSection title="Drawing Tools">
          <DrawingControls
            activeMapMode={activeMapMode}
            onStartDrawing={onStartDrawing}
            onToggleMapMode={onToggleMapMode}
            onStopMapMode={onStopMapMode}
          />
        </SidebarSection>

      </div>

      {showAnalysisPanel && (
        <div className="border-t border-slate-200 bg-white p-4">
          <AnalysisPanel
            polygonStats={polygonAnalysisData}
            selectedPolygons={selectedPolygonIndices}
            onClose={onCloseAnalysis}
          />
        </div>
      )}

      {hasData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 border-t border-slate-200 bg-white p-4">
          <LayerControls
            onTogglePolygons={onTogglePolygons}
            onToggleLines={onToggleLines}
            onTogglePoints={onTogglePoints}
          />
          <Legend />
        </div>
      )}

      {hasData && (
        <div className="border-t border-slate-200 bg-white p-4">
          <MapActionsPanel
            exportEnabled={exportEnabled}
            onExport={onExport}
            onExportKML={onExportKML}
            onClear={onClear}
          />
        </div>
      )}
    </aside>
  );
}