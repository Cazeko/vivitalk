"use client";

const BEANS = [
  { name: "에티오피아 예가체프", note: "꽃향 · 베리", price: "₩18,000", color: "#d4a574" },
  { name: "콜롬비아 수프리모", note: "초콜릿 · 견과", price: "₩16,000", color: "#a8755a" },
  { name: "케냐 AA", note: "자몽 · 와인", price: "₩22,000", color: "#7d4b3a" },
];

export function FakeWebsite() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
        color: "#1a1a1f",
        padding: "26px 38px",
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              display: "inline-block",
            }}
          />
          MyShop
        </div>
        <div
          style={{
            display: "flex",
            gap: 22,
            fontSize: 12,
            color: "#6b6b75",
            fontWeight: 500,
          }}
        >
          <span>홈</span>
          <span style={{ color: "#1a1a1f", fontWeight: 700 }}>원두</span>
          <span>스토리</span>
          <span>매장 안내</span>
        </div>
        <div
          style={{
            fontSize: 11,
            padding: "6px 12px",
            border: "1px solid #1a1a1f",
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          장바구니 (0)
        </div>
      </div>

      {/* Hero */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              color: "#7c3aed",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            오늘 갓 볶은 원두
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              marginBottom: 12,
            }}
          >
            하루를 시작하는<br />
            가장 좋은 방법.
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#6b6b75",
              marginBottom: 18,
              lineHeight: 1.55,
              maxWidth: 280,
            }}
          >
            매일 새벽 직접 로스팅해<br />
            그날의 향을 그대로 담아 보내드립니다.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                padding: "11px 20px",
                background: "#1a1a1f",
                color: "#fff",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              지금 주문하기 →
            </div>
            <div
              style={{
                padding: "11px 18px",
                background: "transparent",
                color: "#1a1a1f",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid #e2e2e8",
              }}
            >
              원두 가이드
            </div>
          </div>
        </div>

        {/* Hero image stand-in */}
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 16,
            background:
              "radial-gradient(circle at 30% 30%, #d4a574 0%, #8f5e3f 60%, #4a2e1f 100%)",
            boxShadow: "0 20px 40px rgba(74,46,31,0.25)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Product grid */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>이번 주 원두</div>
          <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>
            전체 보기 →
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {BEANS.map((b) => (
            <div
              key={b.name}
              style={{
                background: "#fafafa",
                borderRadius: 12,
                padding: 12,
                border: "1px solid #f0f0f4",
              }}
            >
              <div
                style={{
                  height: 64,
                  background: `radial-gradient(circle at 35% 35%, ${b.color}, ${b.color}aa 70%, #2a1810)`,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
              <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.3 }}>
                {b.name}
              </div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{b.note}</div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6 }}>{b.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
