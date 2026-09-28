import {
  Edit3,
  Hand,
  MousePointer2,
  Pentagon,
  Scissors,
  Square,
  Trash2,
  Waypoints,
  X,
} from "lucide-react";
import { createElement } from "react";

const drawingTools = [
  { mode: "Polygon", label: "Polygon", icon: Pentagon },
  { mode: "Line", label: "Line", icon: Waypoints },
  { mode: "Rectangle", label: "Rectangle", icon: Square },
];

const editingTools = [
  { mode: "edit", label: "Edit", icon: Edit3 },
  { mode: "drag", label: "Move", icon: Hand },
  { mode: "cut", label: "Cut", icon: Scissors },
  { mode: "remove", label: "Delete", icon: Trash2 },
];

function ToolButton({ active, icon, label, onClick, tone = "slate" }) {
  const activeClass =
    tone === "danger"
      ? "border-red-300 bg-red-50 text-red-700"
      : "border-blue-300 bg-blue-50 text-blue-700";

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={active}
      className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 ${
        active ? activeClass : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {createElement(icon, { className: "h-5 w-5", "aria-hidden": "true" })}
      <span>{label}</span>
    </button>
  );
}

export default function DrawingControls({
  activeMapMode,
  onStartDrawing,
  onToggleMapMode,
  onStopMapMode,
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <MousePointer2 className="h-4 w-4" aria-hidden="true" />
          Draw
        </div>
        <div className="grid grid-cols-3 gap-2">
          {drawingTools.map(({ mode, label, icon }) => (
            <ToolButton
              key={mode}
              active={activeMapMode === mode}
              icon={icon}
              label={label}
              onClick={() => onStartDrawing(mode)}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Modify
        </div>
        <div className="grid grid-cols-4 gap-2">
          {editingTools.map(({ mode, label, icon }) => (
            <ToolButton
              key={mode}
              active={activeMapMode === mode}
              icon={icon}
              label={label}
              tone={mode === "remove" ? "danger" : "slate"}
              onClick={() => onToggleMapMode(mode)}
            />
          ))}
        </div>
      </div>

      {activeMapMode && (
        <button
          type="button"
          onClick={onStopMapMode}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Stop active tool
        </button>
      )}
    </div>
  );
}
