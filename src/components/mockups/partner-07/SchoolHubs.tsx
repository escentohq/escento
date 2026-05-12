"use client";

import { motion } from "framer-motion";
import { Users, Building2 } from "lucide-react";

const schools = [
  { name: "Berklee College of Music", location: "Boston, MA", active: 428, color: "bg-[#166534]", text: "text-white" },
  { name: "USC Thornton", location: "Los Angeles, CA", active: 312, color: "bg-white", text: "text-[#0F172A]" },
  { name: "NYU Tisch", location: "New York, NY", active: 256, color: "bg-white", text: "text-[#0F172A]" },
  { name: "Belmont University", location: "Nashville, TN", active: 184, color: "bg-[#FF5A5F]", text: "text-white" },
];

export function SchoolHubs() {
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 style={{ fontFamily: 'var(--font-fraunces)' }} className="text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight">
            Active Hubs
          </h2>
          <p className="font-sans text-[#475569] mt-3 max-w-xl text-lg">
            The network is growing across the country. Find your school to see who's open to collaborate right now.
          </p>
        </div>
        <button className="font-sans font-bold text-[#166534] hover:text-[#FF5A5F] transition-colors whitespace-nowrap">
          View all campuses &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {schools.map((school, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`rounded-3xl p-8 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 ${school.color} ${school.text} flex flex-col h-[280px]`}
          >
            <div className="flex items-start justify-between mb-auto">
              <div className={`p-3 rounded-2xl ${school.color === 'bg-white' ? 'bg-[#F4F7F5]' : 'bg-white/20'}`}>
                <Building2 size={24} className={school.text} />
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces)' }} className="text-2xl font-bold leading-tight mb-2">
                {school.name}
              </h3>
              <p className={`font-sans text-sm font-medium mb-6 ${school.color === 'bg-white' ? 'text-[#64748B]' : 'text-white/80'}`}>
                {school.location}
              </p>

              <div className={`flex items-center gap-2 pt-4 border-t ${school.color === 'bg-white' ? 'border-[#E2E8F0]' : 'border-white/20'}`}>
                <Users size={16} />
                <span className="font-sans font-bold">{school.active} active</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
