"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const events = [
  { id: 1, user: "Sarah C.", action: "booked a gig with", target: "Marcus J.", time: "Just now" },
  { id: 2, user: "Elena R.", action: "updated availability", target: "", time: "2m ago" },
  { id: 3, user: "Jazz Ensemble", action: "is looking for a", target: "Bassist", time: "15m ago" },
  { id: 4, user: "David T.", action: "joined the directory", target: "", time: "1h ago" },
  { id: 5, user: "Aisha K.", action: "connected with", target: "Producer", time: "2h ago" },
];

export function LiveActivityFeed() {
  const [activeEvents, setActiveEvents] = useState(events.slice(0, 4));

  // Simulate incoming events
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEvents((prev) => {
        const nextEvent = events[Math.floor(Math.random() * events.length)];
        const newEvent = { ...nextEvent, id: Date.now(), time: "Just now" };
        return [newEvent, ...prev.slice(0, 3)];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E5E3DB]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif italic text-xl text-[#1A1A1A]">Live Activity</h3>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A36] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5A36]"></span>
        </span>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {activeEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-4 items-start pb-4 border-b border-[#F0EFEB] last:border-0 last:pb-0"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFF5F2] text-[#FF5A36] flex items-center justify-center font-serif text-sm flex-shrink-0">
                {event.user.charAt(0)}
              </div>
              <div className="space-y-1">
                <p className="font-sans text-sm text-[#1A1A1A]">
                  <span className="font-medium">{event.user}</span>{" "}
                  <span className="text-[#666666]">{event.action}</span>{" "}
                  {event.target && <span className="font-medium">{event.target}</span>}
                </p>
                <p className="font-sans text-[11px] text-[#999999] uppercase tracking-wider">
                  {event.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
