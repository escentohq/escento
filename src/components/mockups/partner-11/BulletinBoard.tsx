"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ── Color identity ────────────────────────────────────────────────────────────

const CARD_COLORS = [
  { bg: "#FEE2E2", ink: "#991B1B", label: "Coral" },
  { bg: "#DCFCE7", ink: "#166534", label: "Sage" },
  { bg: "#DBEAFE", ink: "#1E40AF", label: "Sky" },
  { bg: "#FEF9C3", ink: "#854D0E", label: "Butter" },
  { bg: "#EDE9FE", ink: "#5B21B6", label: "Lavender" },
  { bg: "#FFEDD5", ink: "#9A3412", label: "Peach" },
];

function colorFromIndex(i: number) {
  return CARD_COLORS[i % CARD_COLORS.length];
}

// ── Floating card mesh ────────────────────────────────────────────────────────

interface CardData {
  id: string;
  name: string;
  role: string;
  school: string;
  colorIndex: number;
  // layout seeds (deterministic from index)
  baseX: number;
  baseY: number;
  baseZ: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
  speed: number;
  rotZ: number;
}

function FloatingCard({ card, reduced }: { card: CardData; reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const color = colorFromIndex(card.colorIndex);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g || reduced) return;
    const t = clock.elapsedTime;
    g.position.x = card.baseX + Math.sin(t * card.speed + card.phaseX) * 0.35;
    g.position.y = card.baseY + Math.cos(t * card.speed + card.phaseY) * 0.22;
    g.rotation.z = card.rotZ + Math.sin(t * 0.28 + card.phaseZ) * 0.04;
  });

  return (
    <group
      ref={groupRef}
      position={[card.baseX, card.baseY, card.baseZ]}
      rotation={[0, 0, card.rotZ]}
    >
      {/* Card face */}
      <mesh>
        <boxGeometry args={[2.1, 1.25, 0.05]} />
        <meshStandardMaterial color={color.bg} roughness={0.85} metalness={0.02} />
      </mesh>
      {/* Card edge shadow mesh behind */}
      <mesh position={[0.04, -0.05, -0.04]}>
        <boxGeometry args={[2.1, 1.25, 0.05]} />
        <meshStandardMaterial color="#00000015" transparent opacity={0.15} />
      </mesh>
      {/* DOM content */}
      <Html
        center
        transform={false}
        occlude={false}
        style={{ width: 160, pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: color.bg,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: color.ink,
              opacity: 0.6,
              margin: "0 0 4px",
            }}
          >
            Musician
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: color.ink,
              margin: "0 0 2px",
              lineHeight: 1.2,
            }}
          >
            {card.name}
          </p>
          <p style={{ fontSize: 11, color: color.ink, opacity: 0.7, margin: 0 }}>
            {card.role}
          </p>
        </div>
      </Html>
    </group>
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────────

const BOARD_CARDS: Omit<CardData, "colorIndex">[] = [
  { id: "bc1", name: "Maya Chen",    role: "Guitar · Vocals",    school: "UT Austin",  baseX: -3.2, baseY:  0.8, baseZ: -0.6, phaseX: 0.0, phaseY: 1.2, phaseZ: 0.4, speed: 0.22, rotZ: -0.08 },
  { id: "bc2", name: "Jordan Lee",   role: "Cello · Classical",  school: "USC",         baseX: -1.0, baseY:  1.1, baseZ:  0.3, phaseX: 1.5, phaseY: 0.3, phaseZ: 1.1, speed: 0.18, rotZ:  0.05 },
  { id: "bc3", name: "Sam Park",     role: "Piano · Producer",   school: "Berklee",     baseX:  1.2, baseY:  0.9, baseZ: -0.9, phaseX: 0.8, phaseY: 2.0, phaseZ: 0.7, speed: 0.25, rotZ: -0.04 },
  { id: "bc4", name: "Priya Kapoor", role: "Violin · Orchestral",school: "UCLA",        baseX:  3.3, baseY:  0.7, baseZ:  0.1, phaseX: 2.1, phaseY: 0.9, phaseZ: 1.8, speed: 0.20, rotZ:  0.09 },
  { id: "bc5", name: "Alex Rivera",  role: "Drums · Percussion", school: "NYU",         baseX: -2.5, baseY: -0.9, baseZ:  0.5, phaseX: 0.5, phaseY: 1.7, phaseZ: 0.2, speed: 0.23, rotZ:  0.06 },
  { id: "bc6", name: "Kim Sato",     role: "Vocals · Songwriter",school: "UT Austin",   baseX:  0.1, baseY: -1.0, baseZ: -0.4, phaseX: 1.9, phaseY: 0.6, phaseZ: 1.4, speed: 0.19, rotZ: -0.07 },
  { id: "bc7", name: "Chris Obi",    role: "Bass · Jazz",        school: "Berklee",     baseX:  2.4, baseY: -0.8, baseZ:  0.2, phaseX: 0.3, phaseY: 1.4, phaseZ: 0.9, speed: 0.21, rotZ:  0.03 },
  { id: "bc8", name: "Lena Müller",  role: "Flute · Baroque",    school: "Juilliard",   baseX: -0.8, baseY: -0.2, baseZ:  0.6, phaseX: 1.2, phaseY: 0.2, phaseZ: 1.6, speed: 0.24, rotZ: -0.05 },
];

function Scene({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();

  useFrame(({ pointer }) => {
    if (reduced) return;
    (camera as THREE.PerspectiveCamera).position.x +=
      (pointer.x * 1.4 - camera.position.x) * 0.04;
    (camera as THREE.PerspectiveCamera).position.y +=
      (pointer.y * 0.7 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={["#FAFAF8"]} />
      <ambientLight intensity={0.85} color="#FFFFFF" />
      <directionalLight position={[4, 6, 5]} intensity={0.6} color="#FFFBF0" />
      <directionalLight position={[-3, -2, 3]} intensity={0.3} color="#EEF4FF" />
      {BOARD_CARDS.map((c, i) => (
        <FloatingCard
          key={c.id}
          card={{ ...c, colorIndex: i }}
          reduced={reduced}
        />
      ))}
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function BulletinBoard({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 60 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene reduced={reduced} />
    </Canvas>
  );
}
