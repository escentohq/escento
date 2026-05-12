"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";

// Pre-compute seeded random positions
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function Network() {
  const { mouse, camera } = useThree();
  
  const particlesCount = 200;
  const maxDistance = 2.5;
  const positions = useMemo(() => new Float32Array(particlesCount * 3), []);
  const phases = useMemo(() => new Float32Array(particlesCount), []);
  const initialPositions = useMemo(() => new Float32Array(particlesCount * 3), []);
  
  useMemo(() => {
    let seed = 42;
    for (let i = 0; i < particlesCount; i++) {
      const x = (seededRandom(seed++) - 0.5) * 16;
      const y = (seededRandom(seed++) - 0.5) * 16;
      const z = (seededRandom(seed++) - 0.5) * 16;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;
      
      phases[i] = seededRandom(seed++) * Math.PI * 2;
    }
  }, [positions, initialPositions, phases]);

  const pointsRef = useRef<THREE.Points>(null);
  const glowPointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Use a ref to store active edge data to avoid re-rendering
  const activeEdgeRef = useRef({ from: -1, to: -1, startTime: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      // Pick random connected nodes
      const from = Math.floor(Math.random() * particlesCount);
      const to = Math.floor(Math.random() * particlesCount);
      activeEdgeRef.current = { from, to, startTime: performance.now() };
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Camera auto-rotation and mouse parallax
    camera.position.x = Math.sin(time * 0.04) * 12 + mouse.x * 1.5;
    camera.position.y = mouse.y * 1.5;
    camera.position.z = Math.cos(time * 0.04) * 12;
    camera.lookAt(0, 0, 0);

    if (!pointsRef.current || !linesRef.current || !glowPointsRef.current) return;

    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = positionsAttr.array as Float32Array;
    
    // Raycasting for hover
    state.raycaster.setFromCamera(mouse, camera);
    const intersects = state.raycaster.intersectObject(pointsRef.current);
    
    let currentHovered = null;
    if (intersects.length > 0) {
      currentHovered = intersects[0].index ?? null;
    }
    if (currentHovered !== hoveredNode) {
      setHoveredNode(currentHovered);
      // Change cursor
      document.body.style.cursor = currentHovered !== null ? 'pointer' : 'auto';
    }

    // Convert mouse to world position for repulsion
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const mousePos = camera.position.clone().add(dir.multiplyScalar(distance));

    const sizes = (pointsRef.current.geometry.attributes.size as THREE.BufferAttribute).array as Float32Array;

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      
      // Base slow drift
      let targetX = initialPositions[i3] + Math.sin(time * 0.2 + phases[i]) * 0.5;
      let targetY = initialPositions[i3 + 1] + Math.cos(time * 0.3 + phases[i]) * 0.5;
      let targetZ = initialPositions[i3 + 2] + Math.sin(time * 0.1 + phases[i]) * 0.5;

      // Mouse repulsion
      const nodePos = new THREE.Vector3(targetX, targetY, targetZ);
      const distToMouse = nodePos.distanceTo(mousePos);
      if (distToMouse < 3) {
        const repulsion = (3 - distToMouse) * 0.3;
        const repulseDir = nodePos.clone().sub(mousePos).normalize();
        targetX += repulseDir.x * repulsion;
        targetY += repulseDir.y * repulsion;
        targetZ += repulseDir.z * repulsion;
      }

      // Smooth transition
      posArray[i3] += (targetX - posArray[i3]) * 0.1;
      posArray[i3 + 1] += (targetY - posArray[i3 + 1]) * 0.1;
      posArray[i3 + 2] += (targetZ - posArray[i3 + 2]) * 0.1;

      // Size update based on hover
      sizes[i] = i === currentHovered ? 8 : 4;
    }
    positionsAttr.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
    glowPointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Update lines
    const linePositions = [];
    const lineColors = [];
    let colorPos = 0;
    
    const active = activeEdgeRef.current;
    const activeTime = performance.now() - active.startTime;
    const isActivePulse = activeTime < 1000;
    const pulseFactor = isActivePulse ? Math.sin((activeTime / 1000) * Math.PI) : 0;

    for (let i = 0; i < particlesCount; i++) {
      for (let j = i + 1; j < particlesCount; j++) {
        const i3 = i * 3;
        const j3 = j * 3;
        const dx = posArray[i3] - posArray[j3];
        const dy = posArray[i3 + 1] - posArray[j3 + 1];
        const dz = posArray[i3 + 2] - posArray[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          linePositions.push(
            posArray[i3], posArray[i3 + 1], posArray[i3 + 2],
            posArray[j3], posArray[j3 + 1], posArray[j3 + 2]
          );

          let alpha = 1 - (dist / maxDistance);
          alpha *= 0.15; // base opacity

          // Hover boost
          if (i === currentHovered || j === currentHovered) {
            alpha = 0.8;
          }

          // Active pulse
          let r = 0, g = 1, b = 0.53; // #00FF88
          if (isActivePulse && ((i === active.from && j === active.to) || (j === active.from && i === active.to))) {
            alpha = 0.6 + pulseFactor * 0.4; // pulses higher
          }

          lineColors.push(r, g, b, alpha, r, g, b, alpha);
        }
      }
    }

    linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesRef.current.geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 4));
  });

  const sizes = useMemo(() => {
    const s = new Float32Array(particlesCount);
    s.fill(4);
    return s;
  }, []);

  return (
    <group>
      {/* Core particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={sizes.length}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`
            attribute float size;
            void main() {
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              // #00FF88
              gl_FragColor = vec4(0.0, 1.0, 0.533, 1.0);
            }
          `}
        />
      </points>

      {/* Glow particles */}
      <points ref={glowPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={12}
          color="#00FF88"
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Edges */}
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export default function NetworkScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="w-full h-full"
    >
      <Canvas camera={{ position: [0, 0, 12], fov: 55 }}>
        <color attach="background" args={["#030305"]} />
        <Network />
      </Canvas>
    </motion.div>
  );
}
