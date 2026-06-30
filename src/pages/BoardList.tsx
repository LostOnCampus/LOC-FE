import { useEffect, useMemo, useState } from "react";
import { C } from "../types";
import type { Post, PostType } from "../types";
import { getPosts } from "../api/posts";
import { PostCard } from "../components/PostCard";

const wrap: React.CSSProperties = { maxWidth: 1160, margin: "0 auto", padding: "34px 24px 60px" };
type Filter = "all" | PostType;
const PAGE_SIZE = 8; // 한 페이지에 보여줄 게시글 수

export default function BoardList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.type === filter)),
    [posts, filter]
  );

  // 필터가 바뀌면 1페이지로 되돌림
  useEffect(() => setPage(1), [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>분실물 · 습득물</h1>
      <p style={{ color: C.sub, margin: "0 0 22px" }}>
        총 <b style={{ color: C.text }}>{filtered.length}</b>건의 게시글이 있습니다.
      </p>

      {/* 필터 탭 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <Tab active={filter === "all"} onClick={() => setFilter("all")}>전체</Tab>
        <Tab active={filter === "lost"} onClick={() => setFilter("lost")} color={C.lost}>분실물</Tab>
        <Tab active={filter === "found"} onClick={() => setFilter("found")} color={C.found}>습득물</Tab>
      </div>

      {loading ? (
        <p style={{ color: C.muted }}>불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <Empty />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {pageItems.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 36 }}>
      <PageBtn disabled={page === 1} onClick={() => onChange(page - 1)}>‹</PageBtn>
      {pages.map((p) => (
        <PageBtn key={p} active={p === page} onClick={() => onChange(p)}>
          {p}
        </PageBtn>
      ))}
      <PageBtn disabled={page === totalPages} onClick={() => onChange(page + 1)}>›</PageBtn>
    </div>
  );
}

function PageBtn({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 38,
        height: 38,
        padding: "0 10px",
        borderRadius: 10,
        border: `1px solid ${active ? C.brand : C.line}`,
        background: active ? C.brand : "#fff",
        color: active ? "#fff" : disabled ? "#c2cad9" : "#55617a",
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Tab({
  active,
  color = C.brand,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 18px",
        borderRadius: 999,
        border: `1px solid ${active ? color : C.line}`,
        background: active ? color : "#fff",
        color: active ? "#fff" : "#55617a",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Empty() {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px dashed ${C.line}`,
        borderRadius: 16,
        padding: "60px 20px",
        textAlign: "center",
        color: C.muted,
      }}
    >
      아직 등록된 게시글이 없어요.
    </div>
  );
}
