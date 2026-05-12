"use client";

import { Environment, Float, Preload } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Particle = {
  t: number;
  factor: number;
  speed: number;
  xFactor: number;
  yFactor: number;
  zFactor: number;
  mx: number;
  my: number;
};

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

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
      meshRef.current.rotation.z =
        rotation[2] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.5;
    }
    if (materialRef.current) {
      materialRef.current.opacity =
        intensity + Math.sin(state.clock.elapsedTime * speed * 2) * 0.1;
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

function FloatingParticles({ count = 80 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp: Particle[] = [];
    for (let i = 0; i < count; i += 1) {
      const base = i + 1;
      temp.push({
        t: seededRandom(base) * 100,
        factor: 20 + seededRandom(base + 101) * 100,
        speed: 0.01 + seededRandom(base + 202) / 200,
        xFactor: -20 + seededRandom(base + 303) * 40,
        yFactor: -20 + seededRandom(base + 404) * 40,
        zFactor: -20 + seededRandom(base + 505) * 40,
        mx: 0,
        my: 0,
      });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    particles.forEach((particle, i) => {
      const { factor, speed, xFactor, yFactor, zFactor } = particle;
      particle.t += speed / 2;
      const t = particle.t;
      const a = Math.cos(t) + Math.sin(t) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.max(0.1, Math.cos(t));

      dummy.position.set(
        xFactor + Math.cos((t / 10) * factor) + (Math.sin(t) * factor) / 10,
        yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10,
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
      void a;
      void b;
    });
    if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
    </instancedMesh>
  );
}

function FloatingShapes() {
  const icoRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const octaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (icoRef.current) {
      icoRef.current.rotation.x = t * 0.15;
      icoRef.current.rotation.y = t * 0.2;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.1;
      torusRef.current.rotation.z = t * 0.25;
    }
    if (octaRef.current) {
      octaRef.current.rotation.y = t * 0.18;
      octaRef.current.rotation.x = t * 0.12;
    }
  });

  return (
    <>
      {/* Blue icosahedron — top left */}
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={1.2}>
        <mesh ref={icoRef} position={[-6, 3, -8]}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial
            color="#0055FF"
            roughness={0.05}
            metalness={0.9}
            transparent
            opacity={0.55}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* Pink torus — right side */}
      <Float speed={2.2} rotationIntensity={0.5} floatIntensity={1.8}>
        <mesh ref={torusRef} position={[7, -2, -10]}>
          <torusGeometry args={[1.4, 0.35, 16, 48]} />
          <meshStandardMaterial
            color="#FF3366"
            roughness={0.1}
            metalness={0.85}
            transparent
            opacity={0.5}
          />
        </mesh>
      </Float>

      {/* Gold octahedron — bottom center */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.0}>
        <mesh ref={octaRef} position={[2, -5, -12]}>
          <octahedronGeometry args={[1.6, 0]} />
          <meshStandardMaterial
            color="#FFB000"
            roughness={0.08}
            metalness={0.88}
            transparent
            opacity={0.45}
          />
        </mesh>
      </Float>
    </>
  );
}

function Scene({ scrollProgress }: { scrollProgress: number }) {
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
      // scroll: drift scene upward and fade as user scrolls down
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        scrollProgress * -8,
        0.08,
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ambient glow spheres */}
      <Float speed={2} rotationIntensity={0} floatIntensity={2}>
        <mesh position={[-viewport.width / 4, viewport.height / 4, -10]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial
            color="#0055FF"
            transparent
            opacity={0.12}
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
            opacity={0.1}
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
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Float>

      {/* Stage light beams */}
      <LightBeam
        color="#0055FF"
        position={[-viewport.width / 2.5, 5, -5]}
        rotation={[0, 0, -Math.PI / 6]}
        intensity={0.18}
        speed={0.8}
      />
      <LightBeam
        color="#FF3366"
        position={[viewport.width / 2.5, 5, -8]}
        rotation={[0, 0, Math.PI / 6]}
        intensity={0.14}
        speed={1.2}
      />
      <LightBeam
        color="#FFB000"
        position={[0, 8, -12]}
        rotation={[0, 0, 0]}
        intensity={0.18}
        speed={1.0}
      />

      <FloatingShapes />
      <FloatingParticles count={80} />

      {/* Accent lighting */}
      <pointLight position={[-8, 4, -4]} color="#0055FF" intensity={6} distance={20} />
      <pointLight position={[8, -2, -6]} color="#FF3366" intensity={5} distance={18} />
      <pointLight position={[0, 6, -8]} color="#FFB000" intensity={4} distance={16} />
    </group>
  );
}

export function StageLightsScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#FAFAFA]"
      aria-hidden="true"
    >
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#FAFAFA"]} />
        <Scene scrollProgress={scrollProgress} />
        <Environment preset="city" />
        <Preload all />
      </Canvas>
      {/* Grain overlay */}
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
