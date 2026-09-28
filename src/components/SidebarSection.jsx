import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SidebarSection({ title, children, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {/* Clickable Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors focus:outline-none"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h2>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Collapsible Content Area */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </section>
  );
}