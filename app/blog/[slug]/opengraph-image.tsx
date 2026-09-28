import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { site } from "@/lib/content";

export const dynamic = "force-static";
export const alt = "Blog post by Adithya Reddy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  // Satori needs PNG/JPEG, so posts with an icon ship a -256.png next to their WebP variants.
  const iconFile = post?.icon ? path.join(process.cwd(), "public", `${post.icon}-256.png`) : null;
  const icon =
    iconFile && fs.existsSync(iconFile) ? `data:image/png;base64,${fs.readFileSync(iconFile).toString("base64")}` : null;
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
          background: "#0e0e0c",
          color: "#edeae3",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "#8a867c", letterSpacing: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#ff6b3d" }} />
            {(post?.tags.join(" · ") ?? "BLOG").toUpperCase()}
          </div>
          {icon ? (
            <img src={icon} width={132} height={132} alt="" style={{ borderRadius: 28, background: "#fff", padding: 10 }} />
          ) : null}
        </div>
        <div style={{ fontSize: post && post.title.length > 60 ? 64 : 78, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>
          {post?.title ?? site.name}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#b5b1a7" }}>
          <span>{site.name}</span>
          <span>{post ? formatDate(post.date) : ""}</span>
        </div>
      </div>
    ),
    size,
  );
}
