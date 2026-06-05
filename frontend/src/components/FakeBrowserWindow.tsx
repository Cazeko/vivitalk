"use client";
import { Float, Html } from "@react-three/drei";
import { FakeWebsite } from "./FakeWebsite";
import { FakeWebsiteAtelier } from "./FakeWebsiteAtelier";
import { DemoWidget, CAFE_SCRIPT, ATELIER_SCRIPT } from "./DemoWidget";

export type BrowserVariant = "cafe" | "atelier";

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  distanceFactor?: number;
  variant?: BrowserVariant;
}

const VARIANT_CONFIG: Record<BrowserVariant, {
  url: string;
  brandName: string;
  brandSubtitle: string;
  themeFrom: string;
  themeTo: string;
  bubbleAccent: string;
}> = {
  cafe: {
    url: "myshop.com",
    brandName: "MyShop AI",
    brandSubtitle: "온라인 · 평균 응답 1초",
    themeFrom: "#7c3aed",
    themeTo: "#a855f7",
    bubbleAccent: "#a78bfa",
  },
  atelier: {
    url: "atelier.kr",
    brandName: "ATELIER AI",
    brandSubtitle: "온라인 · 평균 응답 0.8초",
    themeFrom: "#0f0f12",
    themeTo: "#3a3a45",
    bubbleAccent: "#a8a8b0",
  },
};

export function FakeBrowserWindow({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  distanceFactor = 1.6,
  variant = "cafe",
}: Props) {
  const cfg = VARIANT_CONFIG[variant];
  const script = variant === "cafe" ? CAFE_SCRIPT : ATELIER_SCRIPT;

  return (
    <Float
      speed={1}
      rotationIntensity={0}
      floatIntensity={1}
      floatingRange={[-0.06, 0.06]}
    >
      <group position={position} rotation={rotation} scale={scale}>
        <Html
          transform
          distanceFactor={distanceFactor}
          occlude={false}
          style={{
            pointerEvents: "none",
            userSelect: "none",
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            textRendering: "optimizeLegibility" as const,
            transform: "translateZ(0)",
          }}
        >
          <div
            style={{
              width: 760,
              height: 480,
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
              boxShadow:
                "0 80px 160px rgba(0,0,0,0.55), 0 30px 60px rgba(124,58,237,0.22), 0 0 0 1px rgba(255,255,255,0.06)",
              transform: "translate(-50%, -50%)",
              position: "relative",
            }}
          >
            {/* Browser chrome */}
            <div
              style={{
                height: 40,
                background:
                  "linear-gradient(180deg, #f5f5f8 0%, #ebebf0 100%)",
                borderBottom: "1px solid #d8d8de",
                display: "flex",
                alignItems: "center",
                paddingLeft: 16,
                gap: 8,
              }}
            >
              {/* Traffic lights */}
              <div style={{ display: "flex", gap: 7 }}>
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    background: "#ff5f57",
                    boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.1)",
                  }}
                />
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    background: "#ffbd2e",
                    boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.1)",
                  }}
                />
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    background: "#28c93f",
                    boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.1)",
                  }}
                />
              </div>

              {/* Nav arrows */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginLeft: 16,
                  color: "#a8a8b0",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.4 7.4L14 6l-6 6 6 6 1.4-1.4L10.8 12z" />
                </svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.6 16.6L10 18l6-6-6-6-1.4 1.4L13.2 12z" />
                </svg>
              </div>

              {/* URL bar */}
              <div
                style={{
                  flex: 1,
                  margin: "0 16px",
                  background: "#fff",
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  color: "#666",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
                  border: "1px solid #dfdfe5",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  maxWidth: 360,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#28c93f">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {cfg.url}
              </div>

              {/* Right side icons */}
              <div
                style={{
                  marginRight: 14,
                  display: "flex",
                  gap: 10,
                  color: "#a8a8b0",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </div>
            </div>

            {/* Website body */}
            <div
              style={{
                position: "relative",
                height: "calc(100% - 40px)",
                overflow: "hidden",
              }}
            >
              {variant === "cafe" ? <FakeWebsite /> : <FakeWebsiteAtelier />}
              <DemoWidget
                script={script}
                brandName={cfg.brandName}
                brandSubtitle={cfg.brandSubtitle}
                themeFrom={cfg.themeFrom}
                themeTo={cfg.themeTo}
                bubbleAccent={cfg.bubbleAccent}
              />
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}
