import type { Post, NewPost, PostStatus, Comment, NewInquiry, Inquiry, PostType } from "../types";
import { MOCK_POSTS } from "../data/mockPosts";
import { getCurrentUser, authHeaders } from "./auth";

/**
 * ============================================================
 *  프론트 ↔ 백엔드 연결 (실제 API 명세에 맞춤)
 * ============================================================
 *  - VITE_API_URL 없으면 → mock
 *  - VITE_API_URL 있으면 → 실제 백엔드 (리버스 프록시면 "/api")
 *
 *  공통 규칙:
 *   · 모든 응답은 { success, message, data } 래퍼 → data만 사용
 *   · 목록/검색은 data.content (Spring Page)
 *   · 작성자는 authorName(실명)
 *   · 수정/삭제/작성/상태변경은 X-User-Id 헤더 필요 (authHeaders())
 */

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const USE_MOCK = !API_URL;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 로그인 안 했을 때 대비 기본값 (mock 전용)
const GUEST = { id: 0, studentId: "00000000", name: "게스트" };
function me() {
  return getCurrentUser() ?? GUEST;
}

/* ---------- 응답 래퍼 해제 + fetch 공통 ---------- */
/* eslint-disable @typescript-eslint/no-explicit-any */
async function api(path: string, options?: RequestInit): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    // 백엔드 에러 메시지 추출 시도
    let msg = `요청 실패 (${res.status})`;
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  const json = await res.json();
  return json?.data ?? json; // { success, message, data } → data
}

/* ---------- 백엔드 → 프론트 타입 변환 ---------- */
function normalizePost(r: any): Post {
  return {
    id: r.id,
    userId: r.userId ?? r.user_id,
    authorName: r.authorName ?? r.author_name,
    type: r.type,
    title: r.title,
    itemName: r.itemName ?? r.item_name ?? "",
    category: r.category,
    location: r.location ?? "",
    eventDate: r.eventDate ?? r.event_date ?? "",
    description: r.description ?? "",
    imageUrl: r.imageUrl ?? r.image_url ?? undefined,
    status: r.status,
    createdAt: r.createdAt ?? r.created_at,
    updatedAt: r.updatedAt ?? r.updated_at,
  };
}
function normalizeComment(r: any): Comment {
  return {
    id: r.id,
    postId: r.postId ?? r.post_id,
    userId: r.userId ?? r.user_id,
    authorName: r.authorName ?? r.author_name,
    content: r.content ?? "",
    createdAt: r.createdAt ?? r.created_at ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ---------- mock 저장소 ---------- */
let MOCK_COMMENTS: Comment[] = [
  { id: 1, postId: 2, userId: 21, authorName: "최지우", content: "혹시 카드 색이 파란색인가요?", createdAt: "2026-06-29 13:10" },
  { id: 2, postId: 2, userId: 12, authorName: "조유나", content: "네 맞습니다! 문의 주셔서 감사해요.", createdAt: "2026-06-29 13:25" },
];

/* ============================================================
 *  게시글
 * ============================================================ */

// 목록 (백엔드는 페이지네이션이지만, 프론트는 전체 배열로 다룸 → size 크게 요청)
export async function getPosts(): Promise<Post[]> {
  if (USE_MOCK) {
    await delay(250);
    return [...MOCK_POSTS].sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  }
  const data = await api(`/posts?page=0&size=100`);
  const list = data?.content ?? data ?? [];
  return list.map(normalizePost);
}

// 상세 (comments 포함)
export async function getPost(id: number): Promise<Post | undefined> {
  if (USE_MOCK) {
    await delay(150);
    return MOCK_POSTS.find((p) => p.id === id);
  }
  const data = await api(`/posts/${id}`);
  return data ? normalizePost(data) : undefined;
}

// 댓글 조회 (GET /posts/{id}/comments)
export async function getComments(postId: number): Promise<Comment[]> {
  if (USE_MOCK) {
    await delay(150);
    return MOCK_COMMENTS.filter((c) => c.postId === postId);
  }
  const data = await api(`/posts/${postId}/comments`);
  return (data ?? []).map(normalizeComment);
}

// 등록 (X-User-Id 필요, 201)
export async function createPost(data: NewPost): Promise<Post> {
  if (USE_MOCK) {
    await delay(300);
    const created: Post = {
      ...data,
      id: Date.now(),
      userId: me().id,
      authorName: me().name,
      eventDate: data.eventDate || new Date().toISOString().slice(0, 10),
      status: "PROCESS",
    };
    MOCK_POSTS.unshift(created);
    return created;
  }
  const body = {
    type: data.type,
    title: data.title,
    itemName: data.itemName,
    category: data.category,
    location: data.location,
    eventDate: data.eventDate,
    description: data.description,
    imageUrl: data.imageUrl ?? "",
  };
  const created = await api(`/posts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return normalizePost(created);
}

// 수정 (PUT /posts/{id}, X-User-Id 필요)
export async function updatePost(id: number, data: NewPost): Promise<Post> {
  if (USE_MOCK) {
    await delay(300);
    const post = MOCK_POSTS.find((p) => p.id === id);
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");
    Object.assign(post, data);
    return post;
  }
  const body = {
    type: data.type,
    title: data.title,
    itemName: data.itemName,
    category: data.category,
    location: data.location,
    eventDate: data.eventDate,
    description: data.description,
    imageUrl: data.imageUrl ?? "",
  };
  const updated = await api(`/posts/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return normalizePost(updated);
}

// 이미지 업로드 (multipart/form-data, X-User-Id 필요) → 응답 data가 URL 문자열
export async function uploadImage(file: File): Promise<string> {
  if (USE_MOCK) {
    await delay(200);
    return URL.createObjectURL(file); // mock: 로컬 미리보기 URL
  }
  const form = new FormData();
  form.append("file", file);
  // multipart는 Content-Type을 브라우저가 boundary와 함께 자동 설정하므로 직접 지정하지 않음
  const res = await fetch(`${API_URL}/files/upload`, {
    method: "POST",
    headers: { Accept: "application/json", ...authHeaders() },
    body: form,
  });
  if (!res.ok) throw new Error("이미지 업로드에 실패했습니다.");
  const json = await res.json();
  const data = json?.data ?? json;
  // data가 문자열(URL)이거나 { url: ... } 형태 둘 다 대응
  return typeof data === "string" ? data : data?.url ?? data?.imageUrl ?? "";
}

// 상태 변경 (X-User-Id 필요, body { status })
export async function updatePostStatus(id: number, status: PostStatus): Promise<Post> {
  if (USE_MOCK) {
    await delay(200);
    const post = MOCK_POSTS.find((p) => p.id === id);
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");
    post.status = status;
    return post;
  }
  const updated = await api(`/posts/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return normalizePost(updated);
}

// 삭제 (X-User-Id 필요)
export async function deletePost(id: number): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const i = MOCK_POSTS.findIndex((p) => p.id === id);
    if (i >= 0) MOCK_POSTS.splice(i, 1);
    return;
  }
  await api(`/posts/${id}`, { method: "DELETE", headers: authHeaders() });
}

/* ============================================================
 *  댓글 (등록: POST /posts/{id}/comments, X-User-Id 필요)
 * ============================================================ */
export async function addComment(postId: number, content: string): Promise<Comment> {
  if (USE_MOCK) {
    await delay(200);
    const c: Comment = {
      id: Date.now(),
      postId,
      userId: me().id,
      authorName: me().name,
      content,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    MOCK_COMMENTS.push(c);
    return c;
  }
  const created = await api(`/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  return normalizeComment(created);
}

// 댓글 삭제 (DELETE /posts/{id}/comments/{commentId}, X-User-Id 필요)
export async function deleteComment(postId: number, commentId: number): Promise<void> {
  if (USE_MOCK) {
    await delay(150);
    MOCK_COMMENTS = MOCK_COMMENTS.filter((c) => c.id !== commentId);
    return;
  }
  await api(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

/* ============================================================
 *  검색 (GET /posts/search?keyword=)
 * ============================================================ */
export async function searchPosts(
  query: string,
  scope: { title: boolean; place: boolean; content: boolean }
): Promise<Post[]> {
  const q = query.trim();
  if (USE_MOCK) {
    const all = await getPosts();
    const lq = q.toLowerCase();
    if (!lq) return all;
    return all.filter(
      (p) =>
        (scope.title && (p.title.toLowerCase().includes(lq) || p.itemName.toLowerCase().includes(lq))) ||
        (scope.place && p.location.toLowerCase().includes(lq)) ||
        (scope.content && p.description.toLowerCase().includes(lq))
    );
  }
  if (!q) return getPosts();
  const data = await api(`/posts/search?keyword=${encodeURIComponent(q)}&page=0&size=100`);
  const list = data?.content ?? data ?? [];
  return list.map(normalizePost);
}

/* ============================================================
 *  통계 (GET /posts/stats)
 * ============================================================ */
export interface PostStats {
  totalCount: number;
  lostCount: number;
  foundCount: number;
}
export async function getStats(): Promise<PostStats> {
  if (USE_MOCK) {
    await delay(100);
    const all = MOCK_POSTS;
    return {
      totalCount: all.length,
      lostCount: all.filter((p) => p.type === "LOST").length,
      foundCount: all.filter((p) => p.type === "FOUND").length,
    };
  }
  return api(`/posts/stats`);
}

/* ============================================================
 *  최근 글 (GET /posts/recent) — 홈 화면용
 * ============================================================ */
export async function getRecentPosts(): Promise<Post[]> {
  if (USE_MOCK) {
    const all = await getPosts();
    return all.slice(0, 5);
  }
  const data = await api(`/posts/recent`);
  return (data ?? []).map(normalizePost);
}

/* ============================================================
 *  문의 (inquiries)
 * ============================================================ */
export async function createInquiry(data: NewInquiry): Promise<Inquiry> {
  if (USE_MOCK) {
    await delay(250);
    return { ...data, id: Date.now(), createdAt: new Date().toISOString() };
  }
  return api(`/inquiries`, {
    method: "POST",
    body: JSON.stringify({ name: data.name, phone: data.phone, message: data.message }),
  });
}

// 미사용 방지용 (PostType import 유지)
export type { PostType };
export const apiMode = USE_MOCK ? "mock" : "live";
