"use client";

import { motion, useReducedMotion } from "framer-motion";
import { User, Music, MapPin, Calendar } from "lucide-react";

const mockProfiles = [
  {
    name: "Elena Rostova",
    instrument: "Cello",
    location: "Berklee College of Music",
    availability: "Available for session work",
    tags: ["Classical", "Film Scoring"],
  },
  {
    name: "Marcus Johnson",
    instrument: "Drums",
    location: "NYU Tisch",
    availability: "Booking gigs next month",
    tags: ["Jazz", "R&B", "Funk"],
  },
  {
    name: "Sarah Chen",
    instrument: "Vocals / Keys",
    location: "USC Thornton",
    availability: "Looking for a band",
    tags: ["Indie Pop", "Songwriter"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ProfileCards() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? {} : containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid gap-6 md:grid-cols-3"
    >
      {mockProfiles.map((profile, idx) => (
        <motion.div
          key={idx}
          variants={shouldReduceMotion ? {} : cardVariants}
          whileHover={
            shouldReduceMotion
              ? {}
              : {
                  borderLeftColor: "#00FF88",
                  x: 4,
                  backgroundColor: "#0A1A0F",
                  transition: { duration: 0.2 },
                }
          }
          className="group relative bg-[#080D0A] border border-[#0A1A0F] rounded-md p-6 flex flex-col gap-4 overflow-hidden border-l-[3px] border-l-transparent transition-colors duration-300 cursor-pointer"
        >
          {/* Subtle top gradient */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#00FF88]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-sans font-semibold text-[#E8FFE8] text-lg">
                {profile.name}
              </h3>
              <p className="font-mono text-[12px] text-[#4A7A5A]">
                {profile.instrument}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#050F08] border border-[#0A1A0F] flex items-center justify-center text-[#2A4A36]">
              <User size={18} />
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2 text-[#4A7A5A] font-sans text-sm">
              <MapPin size={14} className="text-[#2A4A36]" />
              {profile.location}
            </div>
            <div className="flex items-center gap-2 text-[#4A7A5A] font-sans text-sm">
              <Calendar size={14} className="text-[#2A4A36]" />
              {profile.availability}
            </div>
          </div>

          <div className="mt-auto pt-4 flex flex-wrap gap-2">
            {profile.tags.map((tag, tagIdx) => (
              <span
                key={tagIdx}
                className="px-2 py-1 rounded bg-[#030305] border border-[#0A1A0F] text-[#4A7A5A] font-mono text-[10px] uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
