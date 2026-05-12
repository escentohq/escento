"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type StackCard = {
  id: string;
  name: string;
  role: string;
  school: string;
  bio: string;
  tags: string[];
  availability: string;
};

const INITIAL_CARDS: StackCard[] = [
  {
    id: "maya",
    name: "Maya Chen",
    role: "Guitar + arrangements",
    school: "UT Austin",
    bio: "Builds warm guitar-led sets for writers rooms, indie films, and tiny festival stages.",
    tags: ["available this week", "live set", "scoring"],
    availability: "Now taking sessions",
  },
  {
    id: "leo",
    name: "Leo Brooks",
    role: "Producer + keys",
    school: "USC",
    bio: "Fast with demos, topline support, and clean stems when the deadline is already close.",
    tags: ["remote friendly", "beats", "mix prep"],
    availability: "Open after 6pm",
  },
  {
    id: "ana",
    name: "Ana Flores",
    role: "Cello + texture design",
    school: "Berklee",
    bio: "Adds emotional weight to short films, recital projects, and ambient collaborative work.",
    tags: ["strings", "composition", "tour ready"],
    availability: "Quiet mode",
  },
];

export function RosterStack() {
  const [cards, setCards] = useState(INITIAL_CARDS);

  const moveToFront = (id: string) => {
    const index = cards.findIndex((card) => card.id === id);
    if (index <= 0) return;

    const reordered = [...cards];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    setCards(reordered);
  };

  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[520px] perspective-1000">
      <AnimatePresence>
        {[...cards].reverse().map((card, reversedIndex) => {
          const index = cards.length - 1 - reversedIndex;
          const isTop = index === 0;

          let x = 0;
          let y = 0;
          let rotate = 0;
          let scale = 1;
          let blur = 0;
          let opacity = 1;
          let zIndex = cards.length - index;

          if (index === 1) {
            x = -20;
            y = 18;
            rotate = -4.5;
            scale = 0.965;
            blur = 0.5;
            opacity = 0.88;
          } else if (index === 2) {
            x = 24;
            y = 36;
            rotate = 3.5;
            scale = 0.93;
            blur = 0.9;
            opacity = 0.68;
          }

          return (
            <motion.article
              key={card.id}
              layoutId={card.id}
              initial={false}
              animate={{
                x,
                y,
                rotate,
                scale,
                zIndex,
                filter: `blur(${blur}px)`,
                opacity,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={() => moveToFront(card.id)}
              className={`absolute left-0 top-0 w-full rounded-[28px] border bg-white/88 p-6 text-left shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl ${
                isTop
                  ? "border-[rgba(23,201,192,0.22)]"
                  : "cursor-pointer border-[rgba(15,23,42,0.08)] hover:border-[rgba(23,201,192,0.28)]"
              }`}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      index === 2 ? "bg-[#B7C3CF]" : "bg-[#17C9C0]"
                    }`}
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#5E7786]">
                    {card.availability}
                  </span>
                </div>
                <span className="rounded-full bg-[#E9FBF9] px-3 py-1 text-[11px] font-semibold text-[#0E7F79]">
                  {isTop ? "featured" : "bring forward"}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[30px] font-semibold tracking-[-0.03em] text-[#0F172A]">
                    {card.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[#255066]">{card.role}</p>
                </div>
                <span className="rounded-full border border-[rgba(15,23,42,0.08)] px-3 py-1 text-[11px] font-medium text-[#516577]">
                  {card.school}
                </span>
              </div>

              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#516577]">{card.bio}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[rgba(23,201,192,0.16)] bg-[#F5FFFE] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#0E7F79]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-[rgba(15,23,42,0.08)] pt-5">
                <p className="max-w-[16rem] text-sm text-[#5E7786]">
                  Compact, personality-first profile cards inspired by the brighter stack direction.
                </p>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isTop
                      ? "bg-[#17C9C0] text-[#062B2A] shadow-[0_12px_30px_rgba(23,201,192,0.24)] hover:bg-[#12B3AB]"
                      : "border border-[rgba(15,23,42,0.08)] bg-white text-[#7B8B98]"
                  }`}
                >
                  {isTop ? "Open profile ->" : "Select card"}
                </button>
              </div>
            </motion.article>
          );
        })}
      </AnimatePresence>

      <div className="pointer-events-none absolute -bottom-4 left-1/2 h-12 w-[72%] -translate-x-1/2 rounded-full bg-[rgba(15,23,42,0.10)] blur-3xl" />
    </div>
  );
}
