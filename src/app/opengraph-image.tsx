import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "HappySent, automatiska födelsedagstårtor";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FDF6EC 0%, #fde8e2 100%)",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 24 }}>🎂</div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            color: "#2D4A3E",
            letterSpacing: -2,
            maxWidth: 900,
            lineHeight: 1.1,
          }}
        >
          HappySent
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            color: "#475569",
            maxWidth: 800,
            lineHeight: 1.35,
          }}
        >
          Automatiska födelsedagstårtor för företag i Malmö
        </div>
        <div style={{ marginTop: 36, fontSize: 24, color: "#E8603C" }}>
          happysent.se
        </div>
      </div>
    ),
    { ...size },
  );
}
