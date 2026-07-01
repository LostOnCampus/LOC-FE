import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../types";
import type { Post } from "../types";
import { getPosts } from "../api/posts";
import { PostCard } from "../components/PostCard";

const wrap: React.CSSProperties = { maxWidth: 1160, margin: "0 auto", padding: "0 24px" };

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const recent = posts.slice(0, 4);
  const lostCount = posts.filter((p) => p.type === "LOST").length;
  const foundCount = posts.filter((p) => p.type === "FOUND").length;

  function submitSearch() {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div>
      {/* HERO */}
      <section style={{ ...wrap, padding: "40px 24px 6px" }}>
        <div
          style={{
            background: "linear-gradient(135deg,#e9f1ff 0%,#f4f8ff 55%,#edf3ff 100%)",
            border: "1px solid #e2ebfb",
            borderRadius: 24,
            padding: "46px 44px",
            display: "flex",
            gap: 36,
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 13px",
                borderRadius: 999,
                background: "#fff",
                border: "1px solid #d5e3fb",
                color: C.brand,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              캠퍼스 분실물 찾기 서비스
            </div>
            <h1
              style={{
                fontSize: 38,
                lineHeight: 1.24,
                fontWeight: 800,
                margin: "0 0 14px",
                letterSpacing: "-0.03em",
              }}
            >
              잃어버린 물건,
              <br />
              여기서 다시 만나요
            </h1>
            <p style={{ fontSize: 16, color: C.sub, lineHeight: 1.6, margin: "0 0 26px" }}>
              분실물과 습득물을 한곳에서. 학번으로 간편하게 등록하고, 함께 주인을 찾아주세요.
            </p>
            <div style={{ display: "flex", gap: 10, maxWidth: 520 }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                placeholder="제목, 장소, 내용으로 검색해 보세요"
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #cfddf7",
                  background: "#fff",
                  fontSize: 15,
                  outline: "none",
                }}
              />
              <button
                onClick={submitSearch}
                style={{
                  background: C.brand,
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "0 26px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                검색
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => navigate("/write?type=LOST")}
                style={pillBtn("#f0c9c9", C.lost)}
              >
                ＋ 분실물 등록
              </button>
              <button
                onClick={() => navigate("/write?type=FOUND")}
                style={pillBtn("#bfe6d2", C.found)}
              >
                ＋ 습득물 등록
              </button>
            </div>
          </div>
          <div
            style={{
              width: 288,
              flex: "none",
              aspectRatio: "4 / 3",
              borderRadius: 18,
              background:
                "repeating-linear-gradient(45deg,#dde8fb,#dde8fb 10px,#d2e0f8 10px,#d2e0f8 20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #cdddf7",
            }}
          >
            <span
              style={{
                fontFamily: "ui-monospace,Menlo,monospace",
                fontSize: 11,
                color: "#6f86b8",
                background: "rgba(255,255,255,0.8)",
                padding: "4px 9px",
                borderRadius: 7,
              }}
            >
              illustration / 안내 이미지
            </span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ ...wrap, padding: "22px 24px 6px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <StatCard label="등록된 게시글" value={posts.length} />
          <StatCard label="분실물" value={lostCount} color={C.lost} />
          <StatCard label="습득물" value={foundCount} color={C.found} />
        </div>
      </section>

      {/* RECENT */}
      <section style={{ ...wrap, padding: "30px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>최근 등록된 글</h2>
          <button
            onClick={() => navigate("/posts")}
            style={{ background: "none", border: "none", color: C.brand, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
          >
            전체 보기 →
          </button>
        </div>
        {loading ? (
          <p style={{ color: C.muted }}>불러오는 중…</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {recent.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "22px 24px" }}>
      <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color ?? C.text }}>{value}</div>
    </div>
  );
}

function pillBtn(border: string, color: string): React.CSSProperties {
  return {
    background: "#fff",
    border: `1px solid ${border}`,
    color,
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };
}
