"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars, Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { FakeBrowserWindow } from "./FakeBrowserWindow";

function FloatingOrb({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * 0.16;
    ref.current.rotation.y = t * 0.2;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.7} floatIntensity={1.1}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 5]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.22}
          metalness={0.55}
          distort={0.4}
          speed={1.6}
          envMapIntensity={1.3}
        />
      </mesh>
    </Float>
  );
}

function ParticleField({ count = 200 }: { count?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.035} color="#a78bfa" transparent opacity={0.55} />
    </points>
  );
}

interface HeroSceneProps {
  /** If true, mirrors a second browser window at top-left (used in /preview). */
  dual?: boolean;
}

export function HeroScene({ dual = false }: HeroSceneProps = {}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 35 }}
      dpr={[1.5, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0b0b10"]} />
      <fog attach="fog" args={["#0b0b10", 10, 28]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 6, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -3, -2]} intensity={0.4} color="#c4b5fd" />

      {/* Background */}
      <Stars radius={45} depth={60} count={1500} factor={3} fade speed={0.8} />
      <ParticleField count={200} />

      {/* Hero — floating browser window, shifted right + smaller to clear hero copy */}
      <FakeBrowserWindow
        position={[4.2, -1.5, 0]}
        rotation={[-0.05, -0.3, 0.02]}
        scale={1}
        distanceFactor={1.2}
      />

      {/* Mirrored window at top-left — ATELIER variant (different site + widget script) */}
      {dual && (
        <FakeBrowserWindow
          position={[-1.9, -0.1, 0]}
          rotation={[-0.05, 0.3, 0.005]}
          scale={1}
          distanceFactor={1.03}
          variant="atelier"
        />
      )}

      <Environment preset="city" />
    </Canvas>
  );
}
