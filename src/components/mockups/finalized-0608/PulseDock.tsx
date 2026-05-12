"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function PulseCluster({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<Array<THREE.Mesh | null>>([]);

  const nodes = useMemo(
    () => [
      { position: [-1.9, 0.4, 0.1], color: "#FF8C62", scale: 0.22 },
      { position: [-0.8, 1.1, -0.1], color: "#A8B0FF", scale: 0.16 },
      { position: [0.25, 0.55, 0.25], color: "#7FD6C2", scale: 0.2 },
      { position: [1.2, 0.95, -0.2], color: "#FFD4C3", scale: 0.12 },
      { position: [1.95, 0.15, 0.12], color: "#FF8C62", scale: 0.15 },
      { position: [1.35, -0.85, -0.25], color: "#A8B0FF", scale: 0.18 },
      { position: [-0.15, -0.95, 0.05], color: "#7FD6C2", scale: 0.14 },
      { position: [-1.35, -0.55, -0.12], color: "#FFD4C3", scale: 0.11 },
    ],
    [],
  );

  const lineGeometry = useMemo(() => {
    const points = new Float32Array([
      -1.9, 0.4, 0.1, -0.8, 1.1, -0.1,
      -0.8, 1.1, -0.1, 0.25, 0.55, 0.25,
      0.25, 0.55, 0.25, 1.2, 0.95, -0.2,
      1.2, 0.95, -0.2, 1.95, 0.15, 0.12,
      1.95, 0.15, 0.12, 1.35, -0.85, -0.25,
      1.35, -0.85, -0.25, -0.15, -0.95, 0.05,
      -0.15, -0.95, 0.05, -1.35, -0.55, -0.12,
      -1.35, -0.55, -0.12, -1.9, 0.4, 0.1,
      -0.8, 1.1, -0.1, 1.35, -0.85, -0.25,
      0.25, 0.55, 0.25, -1.35, -0.55, -0.12,
    ]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    return geometry;
  }, []);

  useFrame(({ clock, pointer }) => {
    const group = groupRef.current;
    if (!group) return;

    const time = clock.getElapsedTime();
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, reduced ? 0.12 : pointer.x * 0.3, 0.04);
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, reduced ? -0.08 : -pointer.y * 0.16, 0.04);

    nodesRef.current.forEach((node, index) => {
      if (!node || reduced) return;
      const base = nodes[index];
      node.position.y = base.position[1] + Math.sin(time * 0.9 + index * 0.6) * 0.08;
      node.position.x = base.position[0] + Math.cos(time * 0.6 + index * 0.5) * 0.04;
      node.scale.setScalar(base.scale * (1 + Math.sin(time * 1.6 + index) * 0.12));
    });
  });

  return (
    <group ref={groupRef} rotation={[-0.18, 0.15, 0.02]}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#A8B0FF" transparent opacity={0.28} />
      </lineSegments>

      {nodes.map((node, index) => (
        <mesh
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={(mesh) => {
            nodesRef.current[index] = mesh;
          }}
          position={node.position as [number, number, number]}
          scale={node.scale}
        >
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color={node.color} transparent opacity={0.95} roughness={0.18} metalness={0.02} />
        </mesh>
      ))}

      <mesh rotation={[1.1, 0.2, 0.35]}>
        <torusGeometry args={[1.8, 0.015, 18, 120]} />
        <meshBasicMaterial color="#FF8C62" transparent opacity={0.26} />
      </mesh>

      <mesh rotation={[1.25, -0.35, -0.12]}>
        <torusGeometry args={[1.15, 0.015, 18, 120]} />
        <meshBasicMaterial color="#7FD6C2" transparent opacity={0.24} />
      </mesh>
    </group>
  );
}

export function PulseDock({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 22, scale: 0.96 }}
      animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={reduced ? undefined : { delay: 0.28, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        reduced
          ? undefined
          : {
              y: -4,
              boxShadow: "0 24px 56px rgba(23,32,51,0.14)",
            }
      }
      className="absolute bottom-4 left-4 right-4 rounded-[26px] border border-white/90 bg-white/86 p-4 shadow-[0_18px_48px_rgba(23,32,51,0.10)] backdrop-blur"
    >
      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B758C]">Pulse live</p>
          <p className="mt-2 text-[15px] font-semibold leading-6 text-[#172033]">
            Profiles moving. Briefs landing.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-[#FFF0EA] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FF8C62]">
              06 + 08
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8090A6]">
              direct + visible
            </span>
          </div>
        </div>

        <div className="relative h-[128px] overflow-hidden rounded-[20px] border border-[rgba(23,32,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(248,249,255,0.95))]">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ position: "absolute", inset: 0 }}>
            <ambientLight intensity={1.15} color="#FFF8F2" />
            <directionalLight position={[-3, 4, 4]} intensity={1.1} color="#FFDCCF" />
            <directionalLight position={[3, 1, 4]} intensity={0.55} color="#CDD2FF" />
            <PulseCluster reduced={reduced} />
          </Canvas>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.74))]" />
        </div>
      </div>
    </motion.div>
  );
}
