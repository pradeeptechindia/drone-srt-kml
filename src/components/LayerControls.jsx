// src/components/LayerControls.jsx
export default function LayerControls({
  onTogglePolygons,
  onToggleLines,
  onTogglePoints,
}) {
  return (
    <div className="space-y-2 text-sm text-slate-700">
      <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <input type="checkbox" defaultChecked onChange={(e) => onTogglePolygons(e.target.checked)} className="h-4 w-4 accent-blue-600" />
        <span>Buildings</span>
      </label>
      <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <input type="checkbox" defaultChecked onChange={(e) => onToggleLines(e.target.checked)} className="h-4 w-4 accent-blue-600" />
        <span>Roads</span>
      </label>
      <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <input type="checkbox" defaultChecked onChange={(e) => onTogglePoints(e.target.checked)} className="h-4 w-4 accent-blue-600" />
        <span>Gates / Points</span>
      </label>
    </div>
  );
}
