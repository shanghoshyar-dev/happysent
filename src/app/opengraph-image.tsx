import { ImageResponse } from "next/og";

import { brandLogoMarkDataUrl } from "@/components/marketing/brand-logo-mark";

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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "linear-gradient(135deg, #FDF6EC 0%, #fde8e2 100%)",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brandLogoMarkDataUrl()}
          alt=""
          width={120}
          height={120}
          style={{ objectFit: "contain", marginRight: 40 }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#2D4A3E",
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            HappySent
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 32,
              color: "#475569",
              maxWidth: 720,
              lineHeight: 1.35,
            }}
          >
            Automatiska födelsedagstårtor för företag i Malmö
          </div>
          <div style={{ marginTop: 36, fontSize: 26, color: "#E8603C" }}>
            happysent.se
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
