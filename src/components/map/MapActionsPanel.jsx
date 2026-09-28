// src/components/map/MapActionsPanel.jsx
import ClearButton from "../ClearButton";
import ExportButton from "../ExportButton";
import ExportKMLButton from "../ExportKMLButton";

export default function MapActionsPanel({ exportEnabled, onExport, onExportKML, onClear }) {
  return (
    <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
      {exportEnabled && <ExportButton onExport={onExport} />}
      {exportEnabled && <ExportKMLButton onExportKML={onExportKML} />}
      <ClearButton onClear={onClear} />
    </div>
  );
}
