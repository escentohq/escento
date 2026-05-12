"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const feed = [
  {
    user: "Maya Chen",
    school: "USC",
    action: "booked a session with",
    targetUser: "David T.",
    targetSchool: "UCLA",
    time: "10m ago",
  },
  {
    user: "Jazz Ensemble",
    school: "Berklee",
    action: "posted an open call for",
    targetUser: "Upright Bassist",
    targetSchool: "",
    time: "1h ago",
  },
  {
    user: "Sarah Jenkins",
    school: "NYU Tisch",
    action: "joined the network",
    targetUser: "",
    targetSchool: "",
    time: "2h ago",
  },
];

export function CampusActivity() {
  return (
    <section className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-black/5">
      <div className="flex items-center justify-between mb-12">
        <h2 style={{ fontFamily: 'var(--font-fraunces)' }} className="text-3xl font-bold text-[#0F172A] tracking-tight">
          Live Cross-Campus
        </h2>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A5F] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF5A5F]"></span>
        </span>
      </div>

      <div className="space-y-6">
        {feed.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-[#F4F7F5] hover:bg-[#EAF0EB] transition-colors cursor-pointer group"
          >
            <div className="flex flex-wrap items-center gap-3 text-[#0F172A] font-sans text-lg">
              <span className="font-bold">{item.user}</span>
              {item.school && (
                <span className="px-2 py-0.5 rounded bg-white text-[#166534] text-xs font-bold uppercase tracking-wider shadow-sm">
                  {item.school}
                </span>
              )}
              
              <span className="text-[#64748B] font-medium text-base">{item.action}</span>
              
              {item.targetUser && (
                <span className="font-bold group-hover:text-[#FF5A5F] transition-colors">{item.targetUser}</span>
              )}
              {item.targetSchool && (
                <span className="px-2 py-0.5 rounded bg-white text-[#0F172A] text-xs font-bold uppercase tracking-wider shadow-sm">
                  {item.targetSchool}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider">
                {item.time}
              </span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0F172A] shadow-sm group-hover:bg-[#FF5A5F] group-hover:text-white transition-colors">
                <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
