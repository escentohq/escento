"use client";

import { Canvas, extend, useFrame, useLoader, useThree } from "@react-three/fiber";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import type { Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

extend({ TextGeometry });

type TextGeometryArgs = ConstructorParameters<typeof TextGeometry>;

declare module "@react-three/fiber" {
  interface ThreeElements {
    textGeometry: {
      args: TextGeometryArgs;
    };
  }
}

const WORDS = [
  {
    text: "JAZZ",
    position: [0, 0.5, 0] as [number, number, number],
    rotation: [0.04, 0.02, -0.03] as [number, number, number],
    depth: 0.4,
    scale: 1,
    color: "#D8D3CA",
    speed: [1.0, 0.8, 0.6],
  },
  {
    text: "INDIE",
    position: [-1.2, -0.8, -3] as [number, number, number],
    rotation: [-0.05, 0.12, 0.02] as [number, number, number],
    depth: 0.3,
    scale: 0.82,
    color: "#B8B0A4",
    speed: [0.72, 1.15, 0.75],
  },
  {
    text: "SOUL",
    position: [2.1, 1.2, -6] as [number, number, number],
    rotation: [0.08, -0.06, 0.04] as [number, number, number],
    depth: 0.25,
    scale: 0.74,
    color: "#A29A90",
    speed: [0.58, 0.86, 1.1],
  },
  {
    text: "FOLK",
    position: [-2.4, 0.2, -9] as [number, number, number],
    rotation: [-0.03, 0.08, -0.06] as [number, number, number],
    depth: 0.2,
    scale: 0.66,
    color: "#8A8278",
    speed: [0.94, 0.62, 0.8],
  },
  {
    text: "CLASSIC",
    position: [1.0, -1.5, -12] as [number, number, number],
    rotation: [0.06, 0.03, 0.07] as [number, number, number],
    depth: 0.18,
    scale: 0.52,
    color: "#7C756D",
    speed: [0.46, 0.76, 0.5],
  },
];

export function TypeSculpture() {
  return (
    <div className="absolute inset-0 z-0 bg-[#F2EFE8]" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.1, 8.5], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "#F2EFE8" }}
      >
        <color attach="background" args={["#F2EFE8"]} />
        <ambientLight intensity={0.5} color="#FFF8F0" />
        <directionalLight position={[3, 6, 4]} intensity={0.8} color="#FFFBF4" />
        <directionalLight position={[-4, -2, 2]} intensity={0.15} color="#E8E0D0" />
        <SculptureField />
      </Canvas>
    </div>
  );
}

function SculptureField() {
  const font = useLoader(FontLoader, "/fonts/playfair-display-900.typeface.json");
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { camera } = useThree();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const handler = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * -2;
    };

    window.addEventListener("pointermove", handler, { passive: true });
    return () => window.removeEventListener("pointermove", handler);
  }, [reduced]);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;

    if (reduced) {
      camera.position.set(0, 0.1, 8.5);
      camera.lookAt(0, 0, -4);
      return;
    }

    const targetX = Math.sin(elapsed * 0.06) * 1.2 + pointer.current.x * 0.6;
    const targetY = Math.cos(elapsed * 0.04) * 0.4 + pointer.current.y * 0.4;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(pointer.current.x * 0.35, pointer.current.y * 0.18, -5);
  });

  return (
    <group ref={groupRef} position={[0, -0.15, -1.2]}>
      {WORDS.map((word) => (
        <GenreWord key={word.text} font={font} reduced={reduced} {...word} />
      ))}
    </group>
  );
}

function GenreWord({
  text,
  position,
  rotation,
  depth,
  scale,
  color,
  speed,
  font,
  reduced,
}: (typeof WORDS)[number] & { font: Font; reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: "#E8E4DC", roughness: 0.9, metalness: 0 }),
      new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 }),
    ],
    [color],
  );

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh || reduced) return;

    mesh.rotation.x += 0.0003 * speed[0];
    mesh.rotation.y += 0.0004 * speed[1];
    mesh.rotation.z += 0.0001 * speed[2];
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale} material={materials}>
      <textGeometry
        args={[
          text,
          {
            font,
            size: 1.28,
            depth,
            curveSegments: 10,
            bevelEnabled: false,
          },
        ]}
      />
    </mesh>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
