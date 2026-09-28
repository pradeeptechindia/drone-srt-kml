// src/components/ExportButton.jsx
export default function ExportButton({ onExport }) {
  return (
    <button
      onClick={onExport}
      className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
    >
      Export GeoJSON
    </button>
  );
}
