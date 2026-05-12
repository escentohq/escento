"use client";

import { Environment, Float, Preload } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function LightBeam({
  color,
  position,
  rotation,
  intensity,
  speed,
}: {
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  intensity: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.5;
    }

    if (materialRef.current) {
      materialRef.current.opacity = intensity + Math.sin(state.clock.elapsedTime * speed * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <cylinderGeometry args={[0.1, 4, 15, 32, 1, true]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={intensity}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function FloatingParticles({ count = 50 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i += 1) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -20 + Math.random() * 40;
      const yFactor = -20 + Math.random() * 40;
      const zFactor = -20 + Math.random() * 40;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.max(0.1, Math.cos(t));

      dummy.position.set(
        (particle.mx / 10) * a +
          xFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t) * factor) / 10,
        (particle.my / 10) * b +
          yFactor +
          Math.sin((t / 10) * factor) +
          (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b +
          zFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t * 3) * factor) / 10,
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
    </instancedMesh>
  );
}

function Scene() {
  const { viewport, mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        (mouse.x * Math.PI) / 10,
        0.05,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -(mouse.y * Math.PI) / 10,
        0.05,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0} floatIntensity={2}>
        <mesh position={[-viewport.width / 4, viewport.height / 4, -10]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial
            color="#0055FF"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0} floatIntensity={2.5}>
        <mesh position={[viewport.width / 4, -viewport.height / 4, -15]}>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial
            color="#FF3366"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Float>
      <Float speed={2.5} rotationIntensity={0} floatIntensity={1.5}>
        <mesh position={[0, 0, -20]}>
          <sphereGeometry args={[8, 32, 32]} />
          <meshBasicMaterial
            color="#FFB000"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Float>

      <LightBeam
        color="#0055FF"
        position={[-viewport.width / 2.5, 5, -5]}
        rotation={[0, 0, -Math.PI / 6]}
        intensity={0.2}
        speed={0.8}
      />
      <LightBeam
        color="#FF3366"
        position={[viewport.width / 2.5, 5, -8]}
        rotation={[0, 0, Math.PI / 6]}
        intensity={0.15}
        speed={1.2}
      />
      <LightBeam
        color="#FFB000"
        position={[0, 8, -12]}
        rotation={[0, 0, 0]}
        intensity={0.2}
        speed={1.0}
      />

      <FloatingParticles count={100} />
    </group>
  );
}

export function StageLightsScene() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#FAFAFA]">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#FAFAFA"]} />
        <Scene />
        <Environment preset="city" />
        <Preload all />
      </Canvas>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
