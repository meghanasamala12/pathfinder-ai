import React, { useState } from "react";

const DashboardTabs: React.FC = () => {
  const tabs = ["Skills", "Courses", "Interests"];
  const [active, setActive] = useState<string>("Skills");

  return (
    <nav role="tablist" aria-label="Profile tabs" className="inline-flex items-center gap-3">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={active === t}
          onClick={() => setActive(t)}
          className={
            `relative px-4 py-2 rounded-lg font-semibold transition-transform duration-150 ease-out focus:outline-none
            ${active === t
              ? "text-purple-600 bg-purple-50 shadow-md transform -translate-y-1"
              : "text-gray-600 hover:text-gray-900 hover:-translate-y-1 hover:shadow-sm"}`
          }
        >
          <span className="relative z-10">{t}</span>
          <span
            aria-hidden
            className={`absolute left-3 right-3 bottom-2 h-1 rounded-full transform transition-transform duration-200 ${active === t ? "scale-x-100 bg-gradient-to-r from-purple-500 to-indigo-600" : "scale-x-0 bg-purple-400/40"}`}
            style={{ transformOrigin: "left center" }}
          />
        </button>
      ))}
    </nav>
  );
};

export default DashboardTabs;
