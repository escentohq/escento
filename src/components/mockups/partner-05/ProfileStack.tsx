"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { PlayCircle, Star, Music, MessageCircle, MapPin } from "lucide-react";

const PROFILES = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "Guitarist & Producer",
    school: "Berklee College of Music",
    color: "#FF6B6B",
    bio: "Looking for vocalists to collab on an indie-pop EP. I bring the riffs and the logic sessions. Let's make something loud.",
    tags: ["Indie Pop", "Logic Pro", "Session Work"],
    image: "https://i.pravatar.cc/300?u=alex",
  },
  {
    id: 2,
    name: "Jamie Chen",
    role: "Vocalist / Topliner",
    school: "USC Thornton",
    color: "#4ECDC4",
    bio: "Jazz-trained, R&B focused. I write hooks that get stuck in your head. Currently tracking vocals for student films and looking for more gigs.",
    tags: ["R&B", "Toplining", "Jazz"],
    image: "https://i.pravatar.cc/300?u=jamie",
  },
  {
    id: 3,
    name: "Samir Patel",
    role: "Drummer",
    school: "NYU Steinhardt",
    color: "#FFE66D",
    bio: "Pocket player with a heavy groove. Available for live gigs, tracking, or just jamming. Setup: 4-piece Ludwig, dry cymbals.",
    tags: ["Funk", "Live Gigs", "Pocket"],
    image: "https://i.pravatar.cc/300?u=samir",
  },
  {
    id: 4,
    name: "Chloe Dubois",
    role: "Film Composer",
    school: "UCLA Herb Alpert",
    color: "#95A5A6",
    bio: "Specializing in lush orchestral arrangements and minimal synth scores. Let's score your senior thesis film.",
    tags: ["Scoring", "Orchestral", "Synth"],
    image: "https://i.pravatar.cc/300?u=chloe",
  },
];

export function ProfileStack() {
  const [cards, setCards] = useState(PROFILES);

  const handleDragEnd = (event: any, info: PanInfo, cardId: number) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
      setCards((current) => current.filter((card) => card.id !== cardId));
    }
  };

  const handleRefresh = () => {
    setCards(PROFILES);
  };

  return (
    <div className="relative w-full max-w-sm h-[500px] mx-auto perspective-[1000px] flex items-center justify-center">
      {cards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-[#94A3B8]" />
          </div>
          <h3 className="font-bold text-xl text-[#0F172A] mb-2">You've seen everyone!</h3>
          <p className="text-[#64748B] text-sm mb-6 max-w-[200px]">Check back later for more profiles.</p>
          <button 
            onClick={handleRefresh}
            className="px-6 py-3 rounded-full bg-[#0F172A] text-white font-semibold text-sm hover:scale-105 transition-transform"
          >
            Start Over
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {cards.map((card, index) => {
          const isTop = index === cards.length - 1;
          const zIndex = cards.length - index;
          const rotateOffset = (index % 2 === 0 ? 1 : -1) * (cards.length - index) * 2;
          
          return (
            <motion.div
              key={card.id}
              className="absolute w-full h-[480px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-[#F1F5F9] overflow-hidden flex flex-col cursor-grab active:cursor-grabbing origin-bottom"
              style={{ zIndex }}
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{
                scale: 1 - (cards.length - 1 - index) * 0.05,
                y: (cards.length - 1 - index) * 15,
                rotateZ: isTop ? 0 : rotateOffset,
                opacity: 1,
              }}
              exit={{
                x: 300,
                opacity: 0,
                rotateZ: 20,
                scale: 0.9,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              drag={isTop ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(e, info) => handleDragEnd(e, info, card.id)}
              whileTap={isTop ? { scale: 0.98 } : {}}
            >
              {/* Colored Header Banner */}
              <div 
                className="h-24 w-full relative shrink-0" 
                style={{ backgroundColor: card.color }}
              >
                {/* Avatar */}
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg rotate-[-3deg]">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                </div>
                
                {/* Top Right Action */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white">
                  <PlayCircle className="w-5 h-5" />
                </div>
              </div>

              {/* Body */}
              <div className="pt-14 px-6 pb-6 flex flex-col flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-multiply">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-[#0F172A] leading-none mb-1">{card.name}</h2>
                    <p className="text-sm font-bold text-[#64748B] flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      {card.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] mb-6 bg-[#F8FAFC] self-start px-2 py-1 rounded-md border border-[#F1F5F9]">
                  <MapPin className="w-3 h-3" />
                  {card.school}
                </div>

                <p className="text-[#334155] text-[15px] leading-relaxed mb-auto font-medium">
                  "{card.bio}"
                </p>

                <div className="mt-6 flex flex-col gap-4 shrink-0">
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: `${card.color}20`, color: card.color }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#0F172A] text-white rounded-xl h-12 font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]">
                      <MessageCircle className="w-4 h-4" />
                      Connect
                    </button>
                    <button className="w-12 h-12 bg-[#F1F5F9] text-[#64748B] rounded-xl flex items-center justify-center font-bold text-sm transition-transform hover:scale-[1.02] hover:bg-[#E2E8F0]">
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
