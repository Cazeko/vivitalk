"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars, OrbitControls, Environment } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function FloatingOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * 0.18;
    ref.current.rotation.y = t * 0.22;
  });
  return (
    <Float speed={2} rotationIntensity={1.1} floatIntensity={1.6}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 6]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.2}
          metalness={0.4}
          distort={0.45}
          speed={2}
          envMapIntensity={1.4}
        />
      </mesh>
    </Float>
  );
}

function ChatBubble3D({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.position.y = position[1] + Math.sin(t * 1.2) * 0.15;
    group.current.rotation.z = Math.sin(t * 0.6) * 0.08;
  });
  return (
    <group ref={group} position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[2.4, 1.6, 0.4]} />
        <meshStandardMaterial color="#7c3aed" metalness={0.3} roughness={0.25} />
      </mesh>
      <mesh position={[-0.4, -0.95, 0]}>
        <coneGeometry args={[0.18, 0.4, 4]} />
        <meshStandardMaterial color="#7c3aed" metalness={0.3} roughness={0.25} />
      </mesh>
      <mesh position={[-0.6, 0.05, 0.21]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#fafafa" emissive="#fafafa" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0.05, 0.21]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#fafafa" emissive="#fafafa" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0.6, 0.05, 0.21]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#fafafa" emissive="#fafafa" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function ParticleField({ count = 800 }: { count?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.04} color="#a78bfa" transparent opacity={0.7} />
    </points>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#0b0b10"]} />
      <fog attach="fog" args={["#0b0b10", 9, 24]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} color="#c4b5fd" />
      <directionalLight position={[-5, 2, -3]} intensity={0.7} color="#f0abfc" />

      <Stars radius={40} depth={60} count={2400} factor={3.5} fade speed={1} />
      <ParticleField count={500} />

      <FloatingOrb position={[-3.2, 1.4, -0.4]} color="#a78bfa" scale={0.95} />
      <FloatingOrb position={[3.5, -0.9, -0.8]} color="#f0abfc" scale={1.15} />
      <FloatingOrb position={[2.4, 1.8, -2.6]} color="#7c3aed" scale={0.7} />
      <FloatingOrb position={[-2.8, -1.6, -2.2]} color="#fdba74" scale={0.6} />

      <ChatBubble3D position={[0, 0.1, 1.4]} scale={1.05} />

      <Environment preset="city" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.7}
        maxPolarAngle={Math.PI / 1.7}
        minPolarAngle={Math.PI / 2.4}
      />
    </Canvas>
  );
}
