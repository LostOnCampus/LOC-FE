import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { C } from "../types";
import type { Post } from "../types";
import { searchPosts } from "../api/posts";
import { PostCard } from "../components/PostCard";

const wrap: React.CSSProperties = { maxWidth: 1160, margin: "0 auto", padding: "34px 24px 60px" };

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [scope, setScope] = useState({ title: true, place: true, content: true });
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function run(q: string) {
    setLoading(true);
    setSearched(true);
    try {
      setResults(await searchPosts(q, scope));
    } finally {
      setLoading(false);
    }
  }

  // 홈에서 ?q=... 로 넘어온 경우 자동 검색
  useEffect(() => {
    const q = params.get("q");
    if (q) run(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit() {
    setParams(query ? { q: query } : {});
    run(query);
  }

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 18px" }}>검색</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="찾고 있는 물건의 키워드를 입력하세요"
          style={{ flex: 1, padding: "14px 16px", borderRadius: 12, border: "1px solid #cfddf7", fontSize: 15, outline: "none" }}
        />
        <button onClick={submit} style={{ background: C.brand, color: "#fff", border: "none", borderRadius: 12, padding: "0 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          검색
        </button>
      </div>

      {/* 검색 범위 */}
      <div style={{ display: "flex", gap: 18, marginBottom: 26 }}>
        <Check checked={scope.title} onChange={(v) => setScope((s) => ({ ...s, title: v }))}>제목</Check>
        <Check checked={scope.place} onChange={(v) => setScope((s) => ({ ...s, place: v }))}>장소</Check>
        <Check checked={scope.content} onChange={(v) => setScope((s) => ({ ...s, content: v }))}>내용</Check>
      </div>

      {!searched ? (
        <p style={{ color: C.muted }}>키워드를 입력해 분실물·습득물을 검색해 보세요.</p>
      ) : loading ? (
        <p style={{ color: C.muted }}>검색 중…</p>
      ) : results.length === 0 ? (
        <div style={{ background: "#fff", border: `1px dashed ${C.line}`, borderRadius: 16, padding: "60px 20px", textAlign: "center", color: C.muted }}>
          “{query}” 에 대한 검색 결과가 없습니다.
        </div>
      ) : (
        <>
          <p style={{ color: C.sub, marginBottom: 16 }}>
            <b style={{ color: C.text }}>{results.length}</b>건의 결과
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {results.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 14.5, color: "#33415c", fontWeight: 600 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: C.brand, width: 16, height: 16 }} />
      {children}
    </label>
  );
}
