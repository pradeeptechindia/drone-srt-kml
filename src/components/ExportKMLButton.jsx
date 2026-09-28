// src/components/ExportKMLButton.jsx
export default function ExportKMLButton({ onExportKML }) {
    return (
        <button
            onClick={onExportKML}
            className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
        >
            Export KML
        </button>
    );
}
