"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ── Curtain panel ─────────────────────────────────────────────────────────────

function Curtain({ side }: { side: "left" | "right" }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(2.8, 5, 1, 32), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const count = pos.count;
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const wave = Math.sin(x * 2.5 + t * 0.4) * 0.06
                 + Math.sin(y * 1.8 + t * 0.3) * 0.04;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
  });

  const xPos = side === "left" ? -4.2 : 4.2;

  return (
    <mesh ref={meshRef} geometry={geo} position={[xPos, 0, -0.5]}>
      <meshStandardMaterial
        color="#2E1065"
        roughness={0.9}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Spotlight cone hint ───────────────────────────────────────────────────────

function SpotlightBeam() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.ConeGeometry(1.6, 4, 32, 1, true), []);

  return (
    <mesh
      ref={meshRef}
      geometry={geo}
      position={[0, 1.5, 0]}
      rotation={[0, 0, Math.PI]}
    >
      <meshBasicMaterial
        color="#FDE68A"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ── Floating profile card ─────────────────────────────────────────────────────

function ProfileCard3D({
  musician,
}: {
  musician: { name: string; role: string; school: string };
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.elapsedTime;
    // Gentle float
    g.position.y = Math.sin(t * 0.5) * 0.06;
    // Mouse tilt
    g.rotation.y += (pointer.x * 0.25 - g.rotation.y) * 0.04;
    g.rotation.x += (-pointer.y * 0.12 - g.rotation.x) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0.8]}>
      {/* Card face */}
      <mesh>
        <boxGeometry args={[2.8, 1.7, 0.06]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.25} metalness={0.04} />
      </mesh>
      {/* Card content via Html */}
      <Html
        center
        style={{
          width: 220,
          pointerEvents: "none",
          userSelect: "none",
        }}
        transform={false}
        occlude={false}
      >
        <div
          style={{
            background: "white",
            borderRadius: 10,
            padding: "14px 18px",
            boxShadow: "0 8px 32px rgba(46,16,101,0.18)",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#16A34A",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#9D8CB0",
              }}
            >
              Open to Collaborate
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#1C0A3C",
              lineHeight: 1.1,
              margin: "0 0 4px",
            }}
          >
            {musician.name}
          </p>
          <p style={{ fontSize: 12, color: "#4B3B6B", margin: 0 }}>{musician.role}</p>
          <p style={{ fontSize: 11, color: "#9D8CB0", margin: "2px 0 0" }}>{musician.school}</p>
        </div>
      </Html>
    </group>
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────────

function Scene({
  musician,
  reduced,
}: {
  musician: { name: string; role: string; school: string };
  reduced: boolean;
}) {
  const spotRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (reduced || !spotRef.current) return;
    const t = clock.elapsedTime;
    spotRef.current.position.x = Math.sin(t * 0.2) * 0.6;
  });

  return (
    <>
      <color attach="background" args={["#F5F0FF"]} />
      <ambientLight intensity={0.12} color="#F5F0FF" />
      <pointLight
        ref={spotRef}
        position={[0, 3.5, 2.5]}
        color="#FDE68A"
        intensity={18}
        decay={1.6}
      />
      <directionalLight position={[3, 4, 3]} intensity={0.3} color="#EDE9FF" />

      <Curtain side="left" />
      <Curtain side="right" />
      <SpotlightBeam />
      <ProfileCard3D musician={musician} />
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function StageScene({
  musician,
  reduced,
}: {
  musician: { name: string; role: string; school: string };
  reduced: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 6], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene musician={musician} reduced={reduced} />
    </Canvas>
  );
}
