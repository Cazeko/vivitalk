"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars, Environment } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
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

/**
 * (A) 화면 비율에 따라 세로 fov를 보정해 "수평 프레이밍"을 일정하게 유지.
 * three.js의 fov는 세로 화각이라, 화면이 기준 비율(16:9)보다 좁아지면 가로 가시 영역이
 * 줄어 오른쪽으로 치우친 창이 잘린다. 좁을수록 fov를 키워(=카메라를 빼는 효과) 가로 구도를 보존.
 */
function ResponsiveCamera({
  baseFov = 35,
  refAspect = 16 / 9,
  maxFov = 60,
}: { baseFov?: number; refAspect?: number; maxFov?: number }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const aspect = size.width / size.height;
    const cam = camera as THREE.PerspectiveCamera;
    // 좁을수록 fov를 키우되, 어안 왜곡을 막기 위해 maxFov로 클램프(나머지는 창 재배치로 처리).
    const widened = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(baseFov) / 2) * (refAspect / aspect)),
    );
    cam.fov = aspect < refAspect ? Math.min(maxFov, widened) : baseFov;
    cam.updateProjectionMatrix();
  }, [camera, size, baseFov, refAspect, maxFov]);
  return null;
}

/**
 * (B) 화면 폭 기준으로 창을 재배치/축소. 좁은 화면(<768px)에서는 창을 중앙으로 모으고
 * 크기를 줄이며, 두 번째(dual) 창은 텍스트와 겹치므로 숨긴다. 데스크톱 구도는 그대로 유지.
 */
function SceneContent({ dual }: { dual: boolean }) {
  const width = useThree((s) => s.size.width);
  const narrow = width < 768;

  return (
    <>
      {/* Hero — floating browser window */}
      <FakeBrowserWindow
        position={narrow ? [0, -1.5, 0] : [4.2, -1.5, 0]}
        rotation={narrow ? [-0.04, -0.12, 0.01] : [-0.05, -0.3, 0.02]}
        scale={narrow ? 0.6 : 1}
        distanceFactor={1.2}
      />

      {/* Mirrored window — ATELIER variant. 좁은 화면에선 숨김(텍스트 겹침 방지) */}
      {dual && !narrow && (
        <FakeBrowserWindow
          position={[-1.9, -0.1, 0]}
          rotation={[-0.05, 0.3, 0.005]}
          scale={1}
          distanceFactor={1.03}
          variant="atelier"
        />
      )}
    </>
  );
}

interface HeroSceneProps {
  /** If true, mirrors a second browser window at top-left (used in /preview). */
  dual?: boolean;
}

export function HeroScene({ dual = false }: HeroSceneProps = {}) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 6.5], fov: 35 }}
      dpr={[1.5, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0b0b10"]} />
      <fog attach="fog" args={["#0b0b10", 10, 28]} />

      {/* (A) 비율 적응 카메라 */}
      <ResponsiveCamera baseFov={35} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 6, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -3, -2]} intensity={0.4} color="#c4b5fd" />

      {/* Background */}
      <Stars radius={45} depth={60} count={1500} factor={3} fade speed={0.8} />
      <ParticleField count={200} />

      {/* (B) 화면 폭에 맞춰 창 재배치/축소 */}
      <SceneContent dual={dual} />

      <Environment preset="city" />
    </Canvas>
  );
}
