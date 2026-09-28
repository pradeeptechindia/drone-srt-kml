// src/components/ClearButton.jsx
export default function ClearButton({ onClear }) {
    return (
        <button
            onClick={onClear}
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
        >
            Clear All Features
        </button>
    );
}
