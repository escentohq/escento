"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERTEX_SHADER = `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying float vWave;

  float gaussian(float x, float sigma) {
    return exp(-(x * x) / (2.0 * sigma * sigma));
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float ribbonA = sin(pos.x * 1.4 + uTime * 0.55) * 0.18;
    float ribbonB = sin(pos.x * 3.6 - uTime * 0.9) * 0.06;
    float ribbonC = sin((pos.x + pos.y) * 2.1 + uTime * 0.5) * 0.08;

    vec2 pointerWorld = uPointer * vec2(5.2, 1.8);
    float distanceToPointer = length(vec2(pos.x, pos.y) - pointerWorld);
    float pointerLift = gaussian(distanceToPointer, 1.7) * 0.24;

    float wave = ribbonA + ribbonB + ribbonC + pointerLift;
    pos.z += wave;
    vWave = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec3 base = vec3(0.985, 0.975, 0.965);
    vec3 coral = vec3(1.0, 0.482, 0.349);
    vec3 lavender = vec3(0.677, 0.690, 1.0);
    vec3 sky = vec3(0.537, 0.859, 0.812);

    float bandA = smoothstep(0.22, 0.82, 1.0 - abs(vUv.y - 0.35 - sin(vUv.x * 5.0) * 0.12));
    float bandB = smoothstep(0.26, 0.9, 1.0 - abs(vUv.y - 0.62 + sin(vUv.x * 3.4 + 0.8) * 0.1));
    float mist = smoothstep(0.0, 1.0, 1.0 - distance(vUv, vec2(0.5, 0.5)));

    vec3 color = base;
    color = mix(color, coral, bandA * 0.36);
    color = mix(color, lavender, bandB * 0.28);
    color = mix(color, sky, mist * 0.1 + clamp(vWave * 0.6, 0.0, 0.14));

    float alpha = 0.52 + bandA * 0.14 + bandB * 0.1;
    gl_FragColor = vec4(color, alpha);
  }
`;

function RibbonSurface({ reduced }: { reduced: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useEffect(() => {
    if (reduced) return;

    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      uniforms.uPointer.value.set(x * 0.8, y * 0.55);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced, uniforms]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    if (!reduced) {
      uniforms.uTime.value = clock.getElapsedTime();
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.18) * 0.05;
    }
  });

  const geometry = useMemo(() => new THREE.PlaneGeometry(9.8, 4.8, 180, 120), []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0.05, 0]} rotation={[-0.16, 0.18, -0.08]}>
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Floaters({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRefs = useRef<Array<THREE.Mesh | null>>([]);

  const items = useMemo(
    () => [
      { position: [-3.2, 1.4, 0.8], scale: 0.18, color: "#FF8C62" },
      { position: [-2.1, -1.25, 0.2], scale: 0.1, color: "#A8B0FF" },
      { position: [-0.8, 1.6, 1.1], scale: 0.12, color: "#7FD6C2" },
      { position: [1.6, -1.4, 0.5], scale: 0.16, color: "#FFC8B4" },
      { position: [2.8, 1.1, 0.9], scale: 0.12, color: "#C8CDFE" },
      { position: [3.4, -0.35, 0.3], scale: 0.08, color: "#7FD6C2" },
    ],
    [],
  );

  useFrame(({ clock, pointer }) => {
    const group = groupRef.current;
    if (!group) return;

    const time = clock.getElapsedTime();
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, reduced ? 0.08 : pointer.x * 0.18, 0.04);
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, reduced ? -0.05 : -pointer.y * 0.1, 0.04);

    orbRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      if (reduced) return;
      mesh.position.y = items[index].position[1] + Math.sin(time * 0.8 + index) * 0.08;
      mesh.position.x = items[index].position[0] + Math.cos(time * 0.55 + index) * 0.05;
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((item, index) => (
        <mesh
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={(node) => {
            orbRefs.current[index] = node;
          }}
          position={item.position as [number, number, number]}
          scale={item.scale}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={item.color} transparent opacity={0.42} roughness={0.2} metalness={0.05} />
        </mesh>
      ))}

      <mesh position={[-2.8, 0.15, -0.8]} rotation={[0.45, 0.2, 0.9]}>
        <torusGeometry args={[0.84, 0.02, 20, 120]} />
        <meshBasicMaterial color="#FF8C62" transparent opacity={0.24} />
      </mesh>
      <mesh position={[2.4, -0.25, -0.6]} rotation={[0.85, -0.15, 0.2]}>
        <torusGeometry args={[1.1, 0.02, 20, 120]} />
        <meshBasicMaterial color="#A8B0FF" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

export function SignalScene({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 6.6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={1.1} color="#FFF7F2" />
      <directionalLight position={[-4, 5, 4]} intensity={1.2} color="#FFE5D9" />
      <directionalLight position={[3, 1, 4]} intensity={0.55} color="#C7CCFF" />
      <pointLight position={[0, 0, 3]} intensity={0.3} color="#7FD6C2" />
      <RibbonSurface reduced={reduced} />
      <Floaters reduced={reduced} />
    </Canvas>
  );
}
