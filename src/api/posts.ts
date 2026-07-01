import type { Post, NewPost, PostStatus, Comment, NewInquiry, Inquiry } from "../types";
import { MOCK_POSTS } from "../data/mockPosts";
import { getCurrentUser } from "./auth";

/**
 * ============================================================
 *  프론트 ↔ 백엔드 연결 지점 (단 하나)
 * ============================================================
 *  - .env 에 VITE_API_URL 없으면 → mock 데이터
 *  - .env 에 VITE_API_URL 있으면 → 실제 백엔드 fetch
 *      VITE_API_URL=http://백엔드_서버_IP:8080
 *
 *  백엔드가 snake_case(event_date, image_url, item_name, user_id …)로 내려줘도
 *  아래 normalize 함수가 프론트 타입(camelCase)으로 자동 변환합니다.
 *  → 페이지 코드는 백엔드 응답 형태와 무관하게 동작.
 */

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const USE_MOCK = !API_URL;

// 로그인 안 했을 때 대비 기본값
const GUEST = { id: 0, studentId: "00000000", name: "게스트" };
function me() {
  return getCurrentUser() ?? GUEST;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---------- 백엔드 응답 → 프론트 타입 변환 ---------- */
// 어떤 키 이름으로 와도 받아내도록 snake/camel 둘 다 확인
/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizePost(r: any): Post {
  return {
    id: r.id,
    userId: r.user_id ?? r.userId,
    authorStudentId:
      r.author_student_id ?? r.student_id ?? r.studentId ?? r.user?.student_id,
    type: r.type,
    title: r.title,
    itemName: r.item_name ?? r.itemName ?? "",
    category: r.category,
    location: r.location,
    eventDate: r.event_date ?? r.eventDate ?? "",
    description: r.description ?? r.desc ?? "",
    imageUrl: r.image_url ?? r.imageUrl ?? undefined,
    status: r.status,
    createdAt: r.created_at ?? r.createdAt,
    updatedAt: r.updated_at ?? r.updatedAt,
  };
}

function normalizeComment(r: any): Comment {
  return {
    id: r.id,
    postId: r.post_id ?? r.postId,
    userId: r.user_id ?? r.userId,
    authorStudentId:
      r.author_student_id ?? r.student_id ?? r.studentId ?? r.user?.student_id,
    content: r.content ?? r.text ?? "",
    createdAt: r.created_at ?? r.createdAt ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ---------- mock 댓글 저장소 ---------- */
let MOCK_COMMENTS: Comment[] = [
  { id: 1, postId: 2, userId: 21, authorStudentId: "20211111", content: "혹시 카드 색이 파란색인가요?", createdAt: "2026-06-29 13:10" },
  { id: 2, postId: 2, userId: 12, authorStudentId: "20219876", content: "네 맞습니다! 문의 주셔서 감사해요.", createdAt: "2026-06-29 13:25" },
];

/* ---------------- 게시글 ---------------- */

export async function getPosts(): Promise<Post[]> {
  if (USE_MOCK) {
    await delay(250);
    return [...MOCK_POSTS].sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  }
  const res = await fetch(`${API_URL}/posts`);
  if (!res.ok) throw new Error("게시글 목록을 불러오지 못했습니다.");
  const data = await res.json();
  return (Array.isArray(data) ? data : data.posts ?? []).map(normalizePost);
}

export async function getPost(id: number): Promise<Post | undefined> {
  if (USE_MOCK) {
    await delay(150);
    return MOCK_POSTS.find((p) => p.id === id);
  }
  const res = await fetch(`${API_URL}/posts/${id}`);
  if (!res.ok) throw new Error("게시글을 불러오지 못했습니다.");
  return normalizePost(await res.json());
}

export async function createPost(data: NewPost): Promise<Post> {
  if (USE_MOCK) {
    await delay(300);
    const created: Post = {
      ...data,
      id: Date.now(),
      userId: me().id,
      authorStudentId: me().studentId,
      eventDate: data.eventDate || new Date().toISOString().slice(0, 10),
      status: "PROCESS",
    };
    MOCK_POSTS.unshift(created);
    return created;
  }
  // 백엔드 컬럼명(snake_case)에 맞춰 전송. status는 서버가 채움.
  // 작성자 연결용 userId 포함 (백엔드가 토큰으로 식별한다면 무시됨).
  const body = {
    user_id: me().id,
    type: data.type,
    title: data.title,
    item_name: data.itemName,
    category: data.category,
    location: data.location,
    event_date: data.eventDate,
    description: data.description,
    image_url: data.imageUrl ?? null,
  };
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("글 등록에 실패했습니다.");
  return normalizePost(await res.json());
}

export async function updatePostStatus(id: number, status: PostStatus): Promise<Post> {
  if (USE_MOCK) {
    await delay(200);
    const post = MOCK_POSTS.find((p) => p.id === id);
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");
    post.status = status;
    return post;
  }
  const res = await fetch(`${API_URL}/posts/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("상태 변경에 실패했습니다.");
  return normalizePost(await res.json());
}

export async function deletePost(id: number): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const i = MOCK_POSTS.findIndex((p) => p.id === id);
    if (i >= 0) MOCK_POSTS.splice(i, 1);
    return;
  }
  const res = await fetch(`${API_URL}/posts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("삭제에 실패했습니다.");
}

/* ---------------- 댓글 ---------------- */

export async function getComments(postId: number): Promise<Comment[]> {
  if (USE_MOCK) {
    await delay(150);
    return MOCK_COMMENTS.filter((c) => c.postId === postId);
  }
  const res = await fetch(`${API_URL}/posts/${postId}/comments`);
  if (!res.ok) throw new Error("댓글을 불러오지 못했습니다.");
  const data = await res.json();
  return (Array.isArray(data) ? data : data.comments ?? []).map(normalizeComment);
}

export async function addComment(postId: number, content: string): Promise<Comment> {
  if (USE_MOCK) {
    await delay(200);
    const c: Comment = {
      id: Date.now(),
      postId,
      userId: me().id,
      authorStudentId: me().studentId,
      content,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    MOCK_COMMENTS.push(c);
    return c;
  }
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, user_id: me().id }),
  });
  if (!res.ok) throw new Error("댓글 등록에 실패했습니다.");
  return normalizeComment(await res.json());
}

/* ---------------- 문의(inquiries) ---------------- */

export async function createInquiry(data: NewInquiry): Promise<Inquiry> {
  if (USE_MOCK) {
    await delay(250);
    return { ...data, id: Date.now(), createdAt: new Date().toISOString() };
  }
  const res = await fetch(`${API_URL}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: data.name, phone: data.phone, message: data.message }),
  });
  if (!res.ok) throw new Error("문의 전송에 실패했습니다.");
  return res.json();
}

/* ---------------- 검색 ---------------- */

export async function searchPosts(
  query: string,
  scope: { title: boolean; place: boolean; content: boolean }
): Promise<Post[]> {
  const all = await getPosts();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((p) => {
    return (
      (scope.title && (p.title.toLowerCase().includes(q) || p.itemName.toLowerCase().includes(q))) ||
      (scope.place && p.location.toLowerCase().includes(q)) ||
      (scope.content && p.description.toLowerCase().includes(q))
    );
  });
}

export const apiMode = USE_MOCK ? "mock" : "live";
