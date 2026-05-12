"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MusicianCardData = {
  id: string;
  name: string;
  instruments: string;
  school: string;
  bio: string;
  tags: string[];
  email: string;
  available: boolean;
};

const MOCK_CARDS: MusicianCardData[] = [
  {
    id: "1",
    name: "Maya Chen",
    instruments: "Guitar · Vocals",
    school: "UT Austin · Music '25",
    bio: '"Indie, folk, film. Available evenings + weekends."',
    tags: ["Guitar", "Vocals", "Indie"],
    email: "hello@maya.example",
    available: true,
  },
  {
    id: "2",
    name: "Elijah Wright",
    instruments: "Drums · Percussion",
    school: "Berklee · Performance '24",
    bio: '"Jazz, funk, session work. Have full kit + transport."',
    tags: ["Drums", "Jazz", "Session"],
    email: "elijah@example.com",
    available: true,
  },
  {
    id: "3",
    name: "Sarah Jenkins",
    instruments: "Piano · Synth",
    school: "NYU · Composition '26",
    bio: '"Classically trained, but love doing electronic and pop."',
    tags: ["Piano", "Synth", "Classical"],
    email: "sarah@example.com",
    available: false,
  }
];

export function StackCards() {
  const [cards, setCards] = useState(MOCK_CARDS);

  const handleCardClick = (id: string) => {
    const clickedIdx = cards.findIndex(c => c.id === id);
    if (clickedIdx === 0) return; // already top
    
    const newCards = [...cards];
    const [clickedCard] = newCards.splice(clickedIdx, 1);
    newCards.unshift(clickedCard);
    setCards(newCards);
  };

  return (
    <div className="relative w-full max-w-[480px] h-[380px] mx-auto perspective-1000">
      <AnimatePresence>
        {[...cards].reverse().map((card, reversedIdx) => {
          const actualIdx = cards.length - 1 - reversedIdx;
          const isTop = actualIdx === 0;
          
          let x = 0;
          let y = 0;
          let rotate = 0;
          let scale = 1;
          let zIndex = cards.length - actualIdx;
          let blur = 0;
          let opacity = 1;

          if (actualIdx === 1) {
            x = -20;
            y = 12;
            rotate = -4;
            scale = 0.95;
            blur = 1;
            opacity = 0.7;
          } else if (actualIdx === 2) {
            x = 20;
            y = 24;
            rotate = 3;
            scale = 0.9;
            blur = 2;
            opacity = 0.4;
          } else if (actualIdx > 2) {
             opacity = 0;
          }

          return (
            <motion.div
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
                opacity
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25
              }}
              onClick={() => handleCardClick(card.id)}
              className={`absolute top-0 left-0 w-full bg-[#111111]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${!isTop ? 'cursor-pointer hover:border-white/20' : ''} ${isTop ? 'border-t-white/30 border-l-white/20' : ''}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full ${card.available ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]' : 'bg-gray-500'}`}></span>
                <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-white/50">
                  {card.available ? 'AVAILABLE' : 'NOT LOOKING'}
                </span>
              </div>
              
              <h3 className="font-semibold text-[22px] text-white mb-1 leading-tight">{card.name}</h3>
              <p className="text-white/70 text-[16px] mb-1">{card.instruments}</p>
              <p className="text-white/50 text-[16px] mb-6">{card.school}</p>

              <p className="text-white/90 text-[16px] italic mb-6">
                {card.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {card.tags.map(tag => (
                  <motion.span 
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/5 text-cyan-300 border border-cyan-400/20 px-3 py-1 rounded-full text-[14px] font-medium cursor-pointer hover:bg-cyan-400/10 hover:border-cyan-400/40 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <a 
                  href={`mailto:${card.email}`} 
                  onClick={(e) => !isTop && e.preventDefault()}
                  className={`flex items-center justify-center px-5 py-2 border border-cyan-400/50 text-cyan-300 rounded-full font-medium text-[15px] hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all ${!isTop ? 'pointer-events-none' : ''}`}
                >
                  Contact &rarr;
                </a>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
