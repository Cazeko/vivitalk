"use client";

const ITEMS = [
  { name: "Wave Tote", category: "BAG", price: "₩189,000", color: "#1a1a1f" },
  { name: "Oxford Shirt", category: "TOP", price: "₩98,000", color: "#e8e6e0" },
  { name: "Linen Pants", category: "BOTTOM", price: "₩142,000", color: "#a8a395" },
];

export function FakeWebsiteAtelier() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0f0f12",
        color: "#fafafa",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
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
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.22em",
          }}
        >
          ATELIER
        </div>
        <div
          style={{
            display: "flex",
            gap: 22,
            fontSize: 11,
            color: "#9a9aa3",
            fontWeight: 500,
            letterSpacing: "0.12em",
          }}
        >
          <span>NEW</span>
          <span style={{ color: "#fafafa", fontWeight: 700 }}>WOMEN</span>
          <span>MEN</span>
          <span style={{ color: "#f0abfc" }}>SALE</span>
        </div>
        <div style={{ display: "flex", gap: 14, color: "#fafafa" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21.71 20.29l-3.4-3.4A8 8 0 1 0 17 18.31l3.4 3.4a1 1 0 0 0 1.41-1.42zM4 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 18a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm10 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2zM6.16 14h11.69a1 1 0 0 0 .95-.68L21 5h-3l-2.5 7H8L4 1H1v2h2l4 11z" />
          </svg>
        </div>
      </div>

      {/* Hero */}
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 10,
            color: "#c4b5fd",
            fontWeight: 700,
            letterSpacing: "0.22em",
            marginBottom: 10,
          }}
        >
          AW26 COLLECTION
        </div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            marginBottom: 14,
          }}
        >
          <span style={{ fontStyle: "italic" }}>Quiet shapes,</span>
          <br />
          <span style={{ fontWeight: 800 }}>louder details.</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              padding: "10px 22px",
              background: "#fafafa",
              color: "#0f0f12",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            SHOP COLLECTION →
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#9a9aa3",
              letterSpacing: "0.08em",
            }}
          >
            FREE SHIPPING OVER ₩100K
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {ITEMS.map((item) => (
          <div key={item.name}>
            <div
              style={{
                height: 86,
                background: item.color,
                marginBottom: 8,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#6e6e78",
                letterSpacing: "0.14em",
                fontWeight: 600,
              }}
            >
              {item.category}
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                marginTop: 3,
                color: "#fafafa",
              }}
            >
              {item.name}
            </div>
            <div style={{ fontSize: 11, color: "#c0c0c8", marginTop: 4 }}>
              {item.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
