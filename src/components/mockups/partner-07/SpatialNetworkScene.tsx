"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Line, Sphere } from "@react-three/drei";
import * as THREE from "three";

// Simulated "Campus Hubs"
const hubs = [
  { pos: new THREE.Vector3(-3, 1, 0), color: "#166534" }, // Ivy Green
  { pos: new THREE.Vector3(2, 2, -2), color: "#FF5A5F" }, // Coral
  { pos: new THREE.Vector3(3, -1, 1), color: "#0F172A" }, // Slate
  { pos: new THREE.Vector3(-1, -2, -1), color: "#166534" },
];

function NetworkConnections() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      // Gentle pulsing of the network
      linesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  // Create connections between all hubs
  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        lines.push([hubs[i].pos, hubs[j].pos]);
      }
    }
    return lines;
  }, []);

  return (
    <group ref={linesRef}>
      {/* Campuses (Hubs) */}
      {hubs.map((hub, idx) => (
        <Float key={`hub-${idx}`} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={hub.pos}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshPhysicalMaterial 
              color={hub.color}
              transmission={0.8}
              opacity={1}
              metalness={0.2}
              roughness={0.1}
              ior={1.5}
              thickness={0.5}
            />
          </mesh>
          {/* Inner core */}
          <mesh position={hub.pos}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color={hub.color} />
          </mesh>
        </Float>
      ))}

      {/* Network Lines */}
      {connections.map((points, idx) => (
        <Line 
          key={`line-${idx}`}
          points={points}
          color="#FF5A5F"
          opacity={0.2}
          transparent
          lineWidth={1}
        />
      ))}
      
      {/* Animated data packets traveling along lines */}
      {connections.map((points, idx) => (
        <DataPacket key={`packet-${idx}`} start={points[0]} end={points[1]} delay={idx * 0.5} />
      ))}
    </group>
  );
}

function DataPacket({ start, end, delay }: { start: THREE.Vector3, end: THREE.Vector3, delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = (state.clock.elapsedTime + delay) % 4; // 4 second loop
      const progress = time / 4;
      meshRef.current.position.lerpVectors(start, end, progress);
      // Fade in and out at ends
      const opacity = Math.sin(progress * Math.PI);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#FF5A5F" transparent opacity={0} />
    </mesh>
  );
}

export function SpatialNetworkScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#FFFFFF" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#FF5A5F" />
        
        <group rotation={[0, 0.5, 0]}>
          <NetworkConnections />
        </group>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
