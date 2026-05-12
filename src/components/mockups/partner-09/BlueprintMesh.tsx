"use client";

import { Html, Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function ExplodedCard({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    if (reduced) {
      group.rotation.x = -0.08;
      group.rotation.y = -0.15;
      return;
    }

    const targetY = Math.sin(state.clock.elapsedTime * 0.15) * 0.3 + state.pointer.x * 0.22;
    const targetX = Math.sin(state.clock.elapsedTime * 0.08) * 0.1 + state.pointer.y * 0.08;

    group.rotation.y += (targetY - group.rotation.y) * 0.05;
    group.rotation.x += (targetX - group.rotation.x) * 0.05;
  });

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 2.55, 0.06]} />
        <meshBasicMaterial color="#EEF4FF" transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 2.55, 0.06]} />
        <meshBasicMaterial color="#2D3FDB" wireframe transparent opacity={0.45} />
      </mesh>

      <mesh position={[0, 0.6, -0.45]}>
        <planeGeometry args={[2.7, 0.42]} />
        <meshBasicMaterial color="#EEF4FF" transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.6, -0.45]}>
        <planeGeometry args={[2.7, 0.42]} />
        <meshBasicMaterial color="#2D3FDB" wireframe transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.02, -0.85]}>
        <planeGeometry args={[3.2, 0.54]} />
        <meshBasicMaterial color="#EEF4FF" transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, -0.85]}>
        <planeGeometry args={[3.2, 0.54]} />
        <meshBasicMaterial color="#2D3FDB" wireframe transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, -0.66, -1.15]}>
        <planeGeometry args={[2.9, 0.34]} />
        <meshBasicMaterial color="#EEF4FF" transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.66, -1.15]}>
        <planeGeometry args={[2.9, 0.34]} />
        <meshBasicMaterial color="#2D3FDB" wireframe transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      <Line
        points={[
          [1.45, 0.8, -0.42],
          [2.6, 1.42, -0.18],
        ]}
        color="#2D3FDB"
        lineWidth={0.9}
        transparent
        opacity={0.6}
      />
      <Html position={[2.95, 1.55, -0.12]} center distanceFactor={8}>
        <div
          className="whitespace-nowrap px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]"
          style={{ background: "rgba(238,244,255,0.92)", border: "1px solid rgba(45,63,219,0.16)" }}
        >
          NAME / ROLE
        </div>
      </Html>

      <Line
        points={[
          [1.6, 0.02, -0.82],
          [2.82, 0.18, -0.4],
        ]}
        color="#2D3FDB"
        lineWidth={0.9}
        transparent
        opacity={0.6}
      />
      <Html position={[3.18, 0.25, -0.28]} center distanceFactor={8}>
        <div
          className="whitespace-nowrap px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]"
          style={{ background: "rgba(238,244,255,0.92)", border: "1px solid rgba(45,63,219,0.16)" }}
        >
          BIO / DETAILS
        </div>
      </Html>

      <Line
        points={[
          [-1.45, -0.65, -1.1],
          [-2.8, -1.28, -0.48],
        ]}
        color="#06B6D4"
        lineWidth={1}
        transparent
        opacity={0.65}
      />
      <Html position={[-3.12, -1.42, -0.3]} center distanceFactor={8}>
        <div
          className="whitespace-nowrap px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]"
          style={{ background: "rgba(238,244,255,0.92)", border: "1px solid rgba(45,63,219,0.16)" }}
        >
          CONTACT / TAGS
        </div>
      </Html>
    </group>
  );
}

export function BlueprintMesh({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 4]} intensity={0.8} color="#2D3FDB" />
      <directionalLight position={[-4, -2, 2]} intensity={0.35} color="#06B6D4" />
      <ExplodedCard reduced={reduced} />
    </Canvas>
  );
}
