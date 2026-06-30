import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { C } from "../types";
import type { Post, Comment } from "../types";
import {
  getPost,
  getComments,
  addComment,
  updatePostStatus,
  deletePost,
  CURRENT_USER,
} from "../api/posts";
import { TypeBadge } from "../components/PostCard";

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "30px 24px 70px" };

// "2026-06-29" -> "06.29"
const shortDate = (d: string) => (d.length >= 10 ? d.slice(5).replace("-", ".") : d);
// "20219876" -> "20219***"
const maskAuthor = (a: string) => (a.length > 5 ? a.slice(0, 5) + "***" : a);

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pid = Number(id);

  const [post, setPost] = useState<Post | undefined>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPost(pid), getComments(pid)])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .finally(() => setLoading(false));
  }, [pid]);

  if (loading) return <div style={wrap}>불러오는 중…</div>;
  if (!post)
    return (
      <div style={wrap}>
        <p style={{ color: C.muted }}>게시글을 찾을 수 없습니다.</p>
        <Link to="/posts" style={{ color: C.brand }}>← 목록으로</Link>
      </div>
    );

  // 데모용: 실제로는 로그인 사용자와 작성자를 비교합니다.
  const isOwner = post.author === CURRENT_USER || true;
  const images = post.images && post.images.length ? post.images : [];
  const resolved = post.status === "resolved";

  async function toggleStatus() {
    if (!post) return;
    setBusy(true);
    try {
      const next = post.status === "resolved" ? "open" : "resolved";
      const updated = await updatePostStatus(post.id, next);
      setPost({ ...post, status: updated.status });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!post) return;
    if (!window.confirm("이 게시글을 삭제할까요?")) return;
    setBusy(true);
    try {
      await deletePost(post.id);
      navigate("/posts");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <button
        onClick={() => navigate("/posts")}
        style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14.5, marginBottom: 18 }}
      >
        ← 목록으로
      </button>

      {/* 2단 레이아웃 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
        {/* 왼쪽: 사진 갤러리 */}
        <div>
          <ImageBox src={images[activeImg]} label="물건 사진" big />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 14 }}>
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => images[i] && setActiveImg(i)}
                style={{
                  padding: 0,
                  border: activeImg === i && images[i] ? `2px solid ${C.brand}` : "none",
                  borderRadius: 14,
                  background: "none",
                  cursor: images[i] ? "pointer" : "default",
                  overflow: "hidden",
                }}
              >
                <ImageBox src={images[i]} />
              </button>
            ))}
          </div>
        </div>

        {/* 오른쪽: 정보 */}
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
            <TypeBadge type={post.type} />
            <StatusBadge resolved={resolved} />
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 22px", lineHeight: 1.3 }}>
            {post.title}
          </h1>

          {/* 정보 카드 */}
          <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "8px 22px", marginBottom: 22 }}>
            <InfoRow label="분류" value={post.category} />
            <InfoRow label="장소" value={post.location} />
            <InfoRow label="날짜" value={shortDate(post.date)} />
            <InfoRow label="등록자" value={maskAuthor(post.author)} last />
          </div>

          <p style={{ fontSize: 16, lineHeight: 1.75, color: "#33415c", whiteSpace: "pre-wrap", marginBottom: 26 }}>
            {post.desc}
          </p>

          {/* 작성자 상태 변경 */}
          {isOwner && (
            <button
              onClick={toggleStatus}
              disabled={busy}
              style={{
                width: "100%",
                background: resolved ? "#fff" : C.found,
                color: resolved ? C.found : "#fff",
                border: resolved ? `1px solid ${C.found}` : "none",
                borderRadius: 12,
                padding: "14px",
                fontSize: 15.5,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              {resolved ? "↩ 다시 '찾는 중'으로 변경" : "✓ 찾았어요 (해결 완료로 변경)"}
            </button>
          )}

          {/* 수정 / 삭제 (작성자) */}
          {isOwner && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate(`/write?type=${post.type}`)} style={subBtn(C.text)}>수정</button>
              <button onClick={onDelete} disabled={busy} style={subBtn(C.lost)}>삭제</button>
            </div>
          )}
        </div>
      </div>

      {/* 댓글 / 문의 */}
      <CommentSection postId={post.id} comments={comments} setComments={setComments} />
    </div>
  );
}

/* ---------- 댓글 영역 ---------- */
function CommentSection({
  postId,
  comments,
  setComments,
}: {
  postId: number;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      const c = await addComment(postId, t);
      setComments((prev) => [...prev, c]);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <section style={{ marginTop: 48, maxWidth: 760 }}>
      <h2 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 16px" }}>
        문의 · 댓글 <span style={{ color: C.brand }}>{comments.length}</span>
      </h2>

      {/* 입력 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="궁금한 점이나 문의를 남겨보세요"
          style={{ flex: 1, padding: "13px 15px", borderRadius: 11, border: "1px solid #cfddf7", fontSize: 15, outline: "none" }}
        />
        <button
          onClick={submit}
          disabled={sending}
          style={{ background: C.brand, color: "#fff", border: "none", borderRadius: 11, padding: "0 24px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          등록
        </button>
      </div>

      {/* 목록 */}
      {comments.length === 0 ? (
        <p style={{ color: C.muted, fontSize: 14.5 }}>아직 댓글이 없어요. 첫 문의를 남겨보세요.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#33415c" }}>{maskAuthor(c.author)}</span>
                <span style={{ fontSize: 12.5, color: C.muted }}>{c.date}</span>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: "#33415c", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- 작은 컴포넌트들 ---------- */
function ImageBox({ src, label, big }: { src?: string; label?: string; big?: boolean }) {
  if (src) {
    return (
      <div style={{ width: "100%", aspectRatio: big ? "4 / 3" : "1 / 1", borderRadius: big ? 18 : 14, overflow: "hidden" }}>
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: big ? "4 / 3" : "1 / 1",
        borderRadius: big ? 18 : 14,
        background: "repeating-linear-gradient(45deg,#eef2fa,#eef2fa 11px,#e7edf8 11px,#e7edf8 22px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {label && (
        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, color: "#94a1bd", background: "rgba(255,255,255,0.85)", padding: "4px 10px", borderRadius: 7 }}>
          {label}
        </span>
      )}
    </div>
  );
}

function StatusBadge({ resolved }: { resolved: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 11px",
        borderRadius: 999,
        background: resolved ? C.foundBg : "#eef0f5",
        color: resolved ? C.found : "#7a869e",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {resolved ? "✓ 해결 완료" : "찾는 중"}
    </span>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        padding: "16px 0",
        borderBottom: last ? "none" : `1px solid ${C.line}`,
      }}
    >
      <span style={{ width: 64, flex: "none", fontSize: 14.5, color: C.muted }}>{label}</span>
      <span style={{ fontSize: 14.5, fontWeight: 700, color: C.text }}>{value}</span>
    </div>
  );
}

function subBtn(color: string): React.CSSProperties {
  return {
    flex: 1,
    background: "#fff",
    color,
    border: `1px solid ${color === "#d64545" ? "#f0c9c9" : C.line}`,
    borderRadius: 12,
    padding: "13px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  };
}
