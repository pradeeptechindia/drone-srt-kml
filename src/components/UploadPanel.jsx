// src/components/UploadPanel.jsx
export default function UploadPanel({ onUpload }) {
    return (
        <div>
            <label className="block text-sm font-semibold mb-3 leading-tight text-slate-800">
                <span className="block">Upload Map Files</span>
                <span className="block text-xs text-gray-500">(KML or Drone SRT)</span>
            </label>
            <label className="block cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700">
                Select Files
                <input
                    type="file"
                    accept=".kml,.srt"
                    multiple
                    onChange={onUpload}
                    className="hidden"
                />
            </label>
        </div>
    );
}
