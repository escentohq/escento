"use client";

import Link from "next/link";

const SECTIONS = [
  { id: "basics", label: "Basics", icon: "👤" },
  { id: "sound", label: "Sound & Skills", icon: "🎵" },
  { id: "portfolio", label: "Portfolio", icon: "🎬" },
  { id: "rates", label: "Rates", icon: "💰" },
  { id: "availability", label: "Availability", icon: "📅" },
  { id: "social", label: "Social Links", icon: "🔗" },
  { id: "equipment", label: "Equipment", icon: "🎸" },
  { id: "preferences", label: "Preferences", icon: "⚙️" },
];

export function Sidebar({ currentTab }: { currentTab: string }) {
  return (
    <nav className="flex flex-col gap-2 lg:sticky lg:top-12 lg:h-fit">
      {SECTIONS.map((section) => {
        const isActive = currentTab === section.id;
        return (
          <Link
            key={section.id}
            href={`/profile/edit?tab=${section.id}`}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#0055FF] text-white"
                : "text-[#64748B] hover:bg-[#F1F5F9]"
            }`}
          >
            <span className="text-lg">{section.icon}</span>
            <span>{section.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
