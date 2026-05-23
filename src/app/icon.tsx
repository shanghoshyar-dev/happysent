import { ImageResponse } from "next/og";

import { brandLogoMarkDataUrl } from "@/components/marketing/brand-logo-mark";

export const runtime = "edge";

export const size = { width: 32, height: 32 };

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FDF6EC",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brandLogoMarkDataUrl()}
          alt=""
          width={26}
          height={26}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
