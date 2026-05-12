"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const VERT = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float gaussian(float x, float sigma) {
    return exp(-(x * x) / (2.0 * sigma * sigma));
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float wave = sin(pos.x * 2.0 + uTime * 0.8) * 0.18
               + sin(pos.x * 5.0 + uTime * 1.4) * 0.09
               + sin(pos.z * 3.0 + uTime * 1.1) * 0.07
               + sin(pos.x * 1.2 - uTime * 0.5) * 0.12;

    // Mouse influence — gaussian falloff from cursor position
    vec2 mouseWorld = uMouse * vec2(10.0, 2.0);
    float dist = length(pos.xz - mouseWorld);
    float influence = gaussian(dist, 1.8) * 0.35;
    wave += influence;

    pos.y += wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAG = `
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(1.0, 0.839, 0.722, 1.0); // #FFD6B8
  }
`;

const WIRE_FRAG = `
  void main() {
    gl_FragColor = vec4(1.0, 0.373, 0.122, 0.22); // accent.orange at 22%
  }
`;

function Mesh({ reduced }: { reduced: boolean }) {
  const solidRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), []);

  // Mouse tracking
  useMemo(() => {
    const handler = (e: MouseEvent) => {
      if (reduced) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      uniforms.uMouse.value.set(x * 0.5, y * 0.3);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [uniforms, reduced]);

  useFrame(({ clock }) => {
    if (reduced) return;
    uniforms.uTime.value = clock.elapsedTime;
  });

  const geometry = useMemo(() => new THREE.PlaneGeometry(22, 4, 128, 32), []);

  return (
    <group rotation={[-Math.PI * 0.18, 0, 0]} position={[0, -0.4, 0]}>
      {/* Solid mesh */}
      <mesh ref={solidRef} geometry={geometry}>
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh ref={wireRef} geometry={geometry}>
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={WIRE_FRAG}
          uniforms={uniforms}
          wireframe
          transparent
        />
      </mesh>
    </group>
  );
}

export function WaveformMesh({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 2.5, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.7} color="#FFF9F0" />
      <directionalLight position={[-4, 6, 3]} intensity={1.1} color="#FFD6B8" />
      <Mesh reduced={reduced} />
    </Canvas>
  );
}
