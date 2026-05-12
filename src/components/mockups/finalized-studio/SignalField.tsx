"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERTEX_SHADER = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uBoost;

  varying float vStrength;

  float waveFn(float x, float z) {
    return sin(x * 1.25 + uTime * 0.55) * 0.10
      + sin(z * 2.15 + uTime * 0.45) * 0.05
      + sin((x + z) * 0.9 - uTime * 0.35) * 0.04;
  }

  void main() {
    vec3 pos = position;
    float proximity = 1.0 - clamp(length(pos.xz - vec2(uPointer.x * 6.0, uPointer.y * 2.2)) / 5.2, 0.0, 1.0);
    float wave = waveFn(pos.x, pos.z) + proximity * 0.08 * uBoost;

    pos.y += wave;
    vStrength = proximity * 0.6 + uBoost * 0.2;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FILL_SHADER = `
  varying float vStrength;

  void main() {
    vec3 base = vec3(0.937, 0.952, 0.980);
    vec3 accent = vec3(0.145, 0.290, 0.839);
    vec3 color = mix(base, accent, clamp(vStrength, 0.0, 0.45));
    gl_FragColor = vec4(color, 0.26);
  }
`;

const WIRE_SHADER = `
  varying float vStrength;

  void main() {
    vec3 wire = vec3(0.106, 0.231, 0.650);
    gl_FragColor = vec4(wire, 0.08 + clamp(vStrength * 0.12, 0.0, 0.12));
  }
`;

function Field({ reduced }: { reduced: boolean }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uBoost: { value: reduced ? 0 : 0.25 },
    }),
    [reduced],
  );

  useEffect(() => {
    if (reduced) return;

    const handleMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      const distance = Math.sqrt(x * x + y * y);
      uniforms.uPointer.value.set(x * 0.85, -y * 0.45);
      uniforms.uBoost.value = Math.max(0.18, 1 - distance * 0.7);
    };

    const handleLeave = () => {
      uniforms.uPointer.value.set(0, 0);
      uniforms.uBoost.value = 0.25;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseout", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseout", handleLeave);
    };
  }, [reduced, uniforms]);

  useFrame(({ clock }) => {
    if (reduced) return;
    uniforms.uTime.value = clock.getElapsedTime();
  });

  const geometry = useMemo(() => new THREE.PlaneGeometry(16, 4.8, 92, 42), []);

  return (
    <group position={[0, -0.7, 0]} rotation={[-Math.PI * 0.22, 0, 0]}>
      <mesh geometry={geometry}>
        <shaderMaterial
          fragmentShader={FILL_SHADER}
          vertexShader={VERTEX_SHADER}
          uniforms={uniforms}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
      <mesh geometry={geometry}>
        <shaderMaterial
          fragmentShader={WIRE_SHADER}
          vertexShader={VERTEX_SHADER}
          uniforms={uniforms}
          side={THREE.DoubleSide}
          wireframe
          transparent
        />
      </mesh>
    </group>
  );
}

export function SignalField({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 2.2, 6], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.9} color="#F7F9FF" />
      <directionalLight position={[-4, 5, 3]} intensity={0.8} color="#DCE6FF" />
      <directionalLight position={[3, 1, 4]} intensity={0.35} color="#214BD6" />
      <Field reduced={reduced} />
    </Canvas>
  );
}
