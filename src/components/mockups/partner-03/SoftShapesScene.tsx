"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei";

function Shapes() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.05;
      group.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[2, 1, -2]}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshDistortMaterial
            color="#FF5A36"
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0.2}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-3, -1, -3]}>
          <torusGeometry args={[1.2, 0.4, 64, 128]} />
          <meshStandardMaterial
            color="#FFD6C9"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      </Float>

      <Float speed={1} rotationIntensity={0.8} floatIntensity={1.5}>
        <mesh position={[0, -2, -5]}>
          <octahedronGeometry args={[2, 2]} />
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.1}
            metalness={0.8}
            envMapIntensity={1}
          />
        </mesh>
      </Float>
    </group>
  );
}

export function SoftShapesScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-multiply">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#FFF5F2" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#FF5A36" />
        
        <Shapes />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
