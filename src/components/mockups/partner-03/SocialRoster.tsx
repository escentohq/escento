"use client";

import { motion } from "framer-motion";
import { User, MapPin, Music } from "lucide-react";

const roster = [
  {
    name: "Elena Rostova",
    instrument: "Cello",
    location: "Berklee",
    tags: ["Classical", "Film"],
    color: "#FFD6C9", // Soft orange tint
  },
  {
    name: "Marcus Johnson",
    instrument: "Drums",
    location: "NYU",
    tags: ["Jazz", "R&B"],
    color: "#E5F0FF", // Soft blue tint
  },
  {
    name: "Sarah Chen",
    instrument: "Vocals",
    location: "USC",
    tags: ["Indie", "Pop"],
    color: "#E8F5E9", // Soft green tint
  },
  {
    name: "David T.",
    instrument: "Guitar",
    location: "Belmont",
    tags: ["Acoustic", "Folk"],
    color: "#FFF3E0", // Soft yellow tint
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function SocialRoster() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between border-b border-[#E5E3DB] pb-4">
        <h2 className="font-serif italic text-3xl text-[#1A1A1A]">The Roster</h2>
        <span className="font-sans text-sm text-[#666666] font-medium">142 Active</span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {roster.map((person, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ y: -8, rotate: idx % 2 === 0 ? 1 : -1, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] cursor-pointer border border-[#E5E3DB] overflow-hidden"
          >
            {/* Subtle color wash background on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" 
              style={{ backgroundColor: person.color }} 
            />

            <div className="relative z-10 flex items-start gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border border-[#E5E3DB] transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: person.color }}
              >
                <User size={24} className="text-[#1A1A1A]" />
              </div>
              
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-serif text-xl text-[#1A1A1A] font-semibold tracking-tight group-hover:text-[#FF5A36] transition-colors">
                    {person.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm font-sans text-[#666666]">
                    <span className="flex items-center gap-1">
                      <Music size={14} />
                      {person.instrument}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {person.location}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {person.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="px-3 py-1 rounded-full bg-[#F9F8F4] border border-[#E5E3DB] text-[#1A1A1A] font-sans text-[11px] uppercase tracking-wider font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
