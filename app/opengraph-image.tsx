import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0d0d0b",
          color: "#ece8df",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "#8c887e", letterSpacing: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#ff6b3d" }} />
          {site.location.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, lineHeight: 0.9, letterSpacing: -6 }}>Adithya</div>
          <div style={{ fontSize: 150, lineHeight: 0.9, letterSpacing: -6, color: "#ff6b3d", fontStyle: "italic" }}>
            Reddy
          </div>
        </div>
        <div style={{ fontSize: 28, color: "#b9b5ab" }}>{site.role}</div>
      </div>
    ),
    size,
  );
}
