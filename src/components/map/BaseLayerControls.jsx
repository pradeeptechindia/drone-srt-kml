// src/components/map/BaseLayerControls.jsx

export default function BaseLayerControls({
  activeBaseLayer,
  onBaseLayerChange
}) {

  return (
    <div className="text-sm">
      <div className="space-y-3">
        {["google", "osm"].map((type) => (
          <label
            key={type}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${activeBaseLayer === type ? "bg-blue-50 border border-blue-200" : ""}`}
          >
            <input
              type="radio"
              checked={activeBaseLayer === type}
              onChange={() => onBaseLayerChange(type)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="font-medium capitalize">
              {type === "google" && "Google Maps"}
              {type === "osm" && "OpenStreetMap"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}