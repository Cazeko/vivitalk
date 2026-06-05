"use client";
import { useEffect, useState } from "react";

export interface Msg {
  role: "bot" | "user";
  text: string;
  source?: string;
}

export const CAFE_SCRIPT: Msg[] = [
  { role: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" },
  { role: "user", text: "오늘 영업시간이 어떻게 되나요?" },
  {
    role: "bot",
    text: "오늘은 오전 10시부터 밤 10시까지 영업합니다. 강남역 3번 출구에서 도보 5분이에요.",
    source: "매장 안내 FAQ",
  },
];

export const ATELIER_SCRIPT: Msg[] = [
  { role: "bot", text: "ATELIER에 오신 것을 환영합니다. 무엇을 찾으세요?" },
  { role: "user", text: "Wave Tote 새 컬러 언제 출시되나요?" },
  {
    role: "bot",
    text: "다음 주 월요일 오전 10시에 출시됩니다. 카키, 베이지 두 가지 색상으로 만나보실 수 있어요.",
    source: "AW26 신상품 일정",
  },
];

interface DemoWidgetProps {
  script?: Msg[];
  brandName?: string;
  brandSubtitle?: string;
  /** Header gradient start + sender bubble + accent solid */
  themeFrom?: string;
  /** Header gradient end */
  themeTo?: string;
  /** Typing dots color (lighter brand tint) */
  bubbleAccent?: string;
}

export function DemoWidget({
  script = CAFE_SCRIPT,
  brandName = "MyShop AI",
  brandSubtitle = "온라인 · 평균 응답 1초",
  themeFrom = "#7c3aed",
  themeTo = "#a855f7",
  bubbleAccent = "#a78bfa",
}: DemoWidgetProps = {}) {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (step >= script.length) {
      timer = setTimeout(() => setStep(0), 4000);
    } else {
      const msg = script[step];
      if (msg.role === "bot" && step > 0) {
        setTyping(true);
        timer = setTimeout(() => {
          setTyping(false);
          setStep((s) => s + 1);
        }, 2000);
      } else {
        timer = setTimeout(() => setStep((s) => s + 1), step === 0 ? 1600 : 1800);
      }
    }
    return () => clearTimeout(timer);
  }, [step, script]);

  // Reset when script changes
  useEffect(() => {
    setStep(0);
    setTyping(false);
  }, [script]);

  const visible = script.slice(0, step);
  const themeGradient = `linear-gradient(135deg, ${themeFrom} 0%, ${themeTo} 100%)`;

  return (
    <div
      style={{
        position: "absolute",
        right: 18,
        bottom: 18,
        width: 290,
        pointerEvents: "none",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
      }}
    >
      {/* Chat panel */}
      <div
        style={{
          width: "100%",
          height: 360,
          background: "#ffffff",
          borderRadius: 18,
          boxShadow: `0 32px 64px rgba(0,0,0,0.18), 0 12px 24px ${themeFrom}1f, 0 0 0 1px rgba(0,0,0,0.04)`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          marginBottom: 14,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: themeGradient,
            color: "#fff",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 9h10v2H7zm0 4h7v2H7z" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{brandName}</span>
            <span
              style={{
                fontSize: 10,
                opacity: 0.85,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                }}
              />
              {brandSubtitle}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: "14px 12px",
            overflow: "hidden",
            background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
            fontSize: 12.5,
          }}
        >
          {visible.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 10,
                animation: "vt-fadein 0.35s ease-out",
              }}
            >
              <div
                style={{
                  maxWidth: "82%",
                  padding: "9px 13px",
                  borderRadius: 14,
                  background: m.role === "user" ? themeFrom : "#f3f3f7",
                  color: m.role === "user" ? "#fff" : "#1e1b4b",
                  lineHeight: 1.5,
                  borderBottomRightRadius: m.role === "user" ? 4 : 14,
                  borderBottomLeftRadius: m.role === "bot" ? 4 : 14,
                  fontWeight: 500,
                }}
              >
                {m.text}
                {m.source && (
                  <div
                    style={{
                      fontSize: 10,
                      color: themeFrom,
                      marginTop: 6,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10.5a1 1 0 0 1-2 0V6H10v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6h-1.5z" />
                    </svg>
                    {m.source}
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: 10,
                animation: "vt-fadein 0.2s ease-out",
              }}
            >
              <div
                style={{
                  padding: "11px 14px",
                  borderRadius: 14,
                  background: "#f3f3f7",
                  borderBottomLeftRadius: 4,
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: bubbleAccent,
                    animation: "vt-bounce 1.3s infinite",
                  }}
                />
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: bubbleAccent,
                    animation: "vt-bounce 1.3s infinite 0.18s",
                  }}
                />
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: bubbleAccent,
                    animation: "vt-bounce 1.3s infinite 0.36s",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input (decorative) */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "1px solid #f0f0f4",
            display: "flex",
            gap: 6,
            background: "#fff",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "9px 14px",
              border: "1px solid #e8e8ee",
              borderRadius: 999,
              fontSize: 11.5,
              color: "#9aa",
              background: "#fafafa",
            }}
          >
            메시지 입력…
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              background: themeFrom,
              color: "#fff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 10px ${themeFrom}4d`,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
        </div>

        <div
          style={{
            fontSize: 10,
            color: "#bbb",
            textAlign: "center",
            padding: "6px 0 8px",
          }}
        >
          Powered by Vivitalk
        </div>
      </div>

      {/* Bubble button */}
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: themeGradient,
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 14px 30px ${themeFrom}73, 0 0 0 4px ${themeFrom}14`,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
          <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 9h10v2H7zm0 4h7v2H7z" />
        </svg>
      </div>
    </div>
  );
}
