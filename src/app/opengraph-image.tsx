import { DATA } from "@/data/resume";
import { ImageResponse } from "next/og";

export const alt = DATA.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inline noise SVG as base64 so Satori can render it without network access
const NOISE_SVG = `data:image/svg+xml;base64,${Buffer.from(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`
).toString("base64")}`;

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#0d0d0d",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grain texture overlay */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={NOISE_SVG}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.08,
            mixBlendMode: "overlay",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
            position: "relative",
          }}
        >
          {/* Top: site URL */}
          <span
            style={{
              fontSize: 20,
              letterSpacing: "0.15em",
              color: "#666",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            {DATA.url.replace("https://", "")}
          </span>

          {/* Middle: name + role */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: "#f5f5f5",
                lineHeight: 1,
                fontFamily: "sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {DATA.name}
            </span>
            <span
              style={{
                fontSize: 32,
                color: "#888",
                fontFamily: "sans-serif",
                fontWeight: 400,
              }}
            >
              {DATA.description}
            </span>
          </div>

          {/* Bottom spacer */}
          <div style={{ display: "flex" }} />
        </div>
      </div>
    ),
    size
  );
}
