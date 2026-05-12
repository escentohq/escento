"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERTEX_SHADER = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uBoost;

  varying float vStrength;

  float waveFn(float x, float z, float speed) {
    return sin(x * 1.8 + uTime * speed) * 0.16
      + sin(x * 4.1 + uTime * (speed * 1.35)) * 0.06
      + sin(z * 2.8 + uTime * (speed * 0.92)) * 0.05
      + sin((x + z) * 1.2 - uTime * (speed * 0.7)) * 0.08;
  }

  void main() {
    vec3 pos = position;
    float proximity = 1.0 - clamp(length(pos.xz - vec2(uPointer.x * 7.2, uPointer.y * 2.6)) / 5.8, 0.0, 1.0);
    float speed = mix(0.45, 1.45, uBoost);
    float wave = waveFn(pos.x, pos.z, speed);
    wave += proximity * 0.18 * (0.45 + uBoost);

    pos.y += wave;
    vStrength = proximity + uBoost * 0.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FILL_FRAGMENT = `
  varying float vStrength;

  void main() {
    vec3 low = vec3(0.905, 0.973, 0.969);
    vec3 high = vec3(0.090, 0.788, 0.753);
    vec3 color = mix(low, high, clamp(vStrength * 0.7, 0.0, 1.0));
    gl_FragColor = vec4(color, 0.74);
  }
`;

const WIRE_FRAGMENT = `
  varying float vStrength;

  void main() {
    vec3 base = vec3(0.055, 0.431, 0.443);
    gl_FragColor = vec4(base, 0.18 + clamp(vStrength * 0.22, 0.0, 0.22));
  }
`;

function FrequencySurface({ reduced }: { reduced: boolean }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uBoost: { value: reduced ? 0 : 0.24 },
    }),
    [reduced],
  );

  useEffect(() => {
    if (reduced) return;

    const handleMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      const distance = Math.sqrt(x * x + y * y);
      const boost = Math.max(0, 1 - distance * 0.75);

      uniforms.uPointer.value.set(x * 0.9, -y * 0.55);
      uniforms.uBoost.value = boost;
    };

    const handleLeave = () => {
      uniforms.uPointer.value.set(0, 0);
      uniforms.uBoost.value = 0.24;
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

  const geometry = useMemo(() => new THREE.PlaneGeometry(18, 5.8, 128, 56), []);

  return (
    <group position={[0, -0.75, 0]} rotation={[-Math.PI * 0.22, 0, 0]}>
      <mesh geometry={geometry}>
        <shaderMaterial
          fragmentShader={FILL_FRAGMENT}
          vertexShader={VERTEX_SHADER}
          uniforms={uniforms}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
      <mesh geometry={geometry}>
        <shaderMaterial
          fragmentShader={WIRE_FRAGMENT}
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

export function FrequencyMesh({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 2.25, 6.2], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.95} color="#F7FFFE" />
      <directionalLight position={[-4, 5, 3]} intensity={1.15} color="#B3FFF9" />
      <directionalLight position={[3, 1, 4]} intensity={0.55} color="#0FA99E" />
      <FrequencySurface reduced={reduced} />
    </Canvas>
  );
}
