import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };

export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 32,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width={140}
          height={140}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="19"
            width="26"
            height="10"
            rx="3"
            fill="#FDF6EC"
            stroke="#fbd0c5"
            strokeWidth="0.75"
          />
          <path
            d="M3 19c2.5-2.8 5-2.8 7.5 0s5-2.8 7.5 0 5-2.8 7.5 0"
            fill="#E8603C"
          />
          <rect
            x="7"
            y="11"
            width="18"
            height="9"
            rx="2.5"
            fill="#FDF6EC"
            stroke="#fbd0c5"
            strokeWidth="0.75"
          />
          <path
            d="M7 11c2-2.2 4-2.2 6 0s4-2.2 6 0 4-2.2 6 0"
            fill="#d54e30"
          />
          <circle cx="16" cy="7.5" r="2.2" fill="#E8603C" />
          <circle cx="13.8" cy="9.2" r="1.5" fill="#f07d62" />
          <circle cx="18.2" cy="9.2" r="1.5" fill="#f07d62" />
          <circle cx="16" cy="10.5" r="1.5" fill="#fbd0c5" />
          <ellipse
            cx="21"
            cy="8.5"
            rx="2.2"
            ry="1.1"
            fill="#2D4A3E"
            transform="rotate(28 21 8.5)"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
