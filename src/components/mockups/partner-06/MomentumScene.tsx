"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Preload } from "@react-three/drei";
import * as THREE from "three";

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-viewport.width / 4, viewport.height / 4, -5]}>
          <torusGeometry args={[2, 0.4, 16, 100]} />
          <meshStandardMaterial color="#CCFF00" roughness={0.1} metalness={0.1} />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[viewport.width / 3, -viewport.height / 3, -10]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color="#CCFF00" roughness={0.2} metalness={0.2} wireframe />
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={1} floatIntensity={3}>
        <mesh position={[0, -viewport.height / 4, -8]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

export function MomentumScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#FFFFFF" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#CCFF00" />
        <FloatingShapes />
        <Environment preset="studio" />
        <Preload all />
      </Canvas>
    </div>
  );
}
