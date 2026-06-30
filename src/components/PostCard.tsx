import { Link } from "react-router-dom";
import { C } from "../types";
import type { Post } from "../types";

// 분실물/습득물 배지 (목업 색상 그대로)
export function TypeBadge({ type }: { type: Post["type"] }) {
  const isLost = type === "lost";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: isLost ? C.lostBg : C.foundBg,
        color: isLost ? C.lost : C.found,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {isLost ? "분실물" : "습득물"}
    </span>
  );
}

// 게시글 카드 (목록/홈/검색 결과 공용)
export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/posts/${post.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: "#fff",
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(20,30,60,0.05)",
        transition: "all .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#bcd0f7";
        e.currentTarget.style.boxShadow = "0 10px 26px rgba(47,111,237,0.13)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.line;
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(20,30,60,0.05)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* 이미지 자리 (목업과 동일한 줄무늬 placeholder) */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          background:
            "repeating-linear-gradient(45deg,#eef2fa,#eef2fa 9px,#e7edf8 9px,#e7edf8 18px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "ui-monospace,Menlo,monospace",
            fontSize: 10.5,
            color: "#94a1bd",
            background: "rgba(255,255,255,0.78)",
            padding: "3px 8px",
            borderRadius: 6,
          }}
        >
          이미지
        </span>
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <TypeBadge type={post.type} />
        </div>
        {post.status === "resolved" && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "4px 10px",
              borderRadius: 999,
              background: C.found,
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            ✓ 해결
          </div>
        )}
      </div>
      <div style={{ padding: "14px 15px 16px" }}>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 5 }}>
          {post.category}
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 700,
            color: C.text,
            lineHeight: 1.35,
            marginBottom: 10,
          }}
        >
          {post.title}
        </div>
        <div style={{ fontSize: 12.5, color: "#7a869e" }}>
          {post.location} · {post.date}
        </div>
      </div>
    </Link>
  );
}
