// src/components/Legend.jsx
export default function Legend() {
  return (
    <div className="text-sm text-slate-700">
      <h4 className="mb-2 font-semibold text-slate-800">Legend</h4>
      <div className="flex items-center mb-1">
        <span className="inline-block w-5 h-5 rounded-full bg-[#00cc00] border-2 border-[#008000] mr-2"></span>
        Gates / Points
      </div>
      <div className="flex items-center mb-1">
        <span className="inline-block w-6 h-3 bg-[#66b3ff] border-2 border-[#0077ff] mr-2"></span>
        Buildings (Polygons)
      </div>
      <div className="flex items-center">
        <span className="inline-block w-6 h-1 bg-[#ff0000] border-2 border-[#ff0000] mr-2"></span>
        Roads (Lines)
      </div>
    </div>
  );
}
