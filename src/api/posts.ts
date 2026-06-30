import type { Post, NewPost, PostStatus, Comment } from "../types";
import { MOCK_POSTS } from "../data/mockPosts";

/**
 * ============================================================
 *  여기가 "프론트 ↔ 백엔드"를 잇는 단 하나의 지점입니다.
 * ============================================================
 *
 *  - .env 에 VITE_API_URL 이 없으면  → mock 데이터로 동작 (API 없이 화면 완성용)
 *  - .env 에 VITE_API_URL 이 있으면  → 실제 백엔드 서버로 fetch
 *
 *  내일 API가 나오면 .env 파일에 아래 한 줄만 추가하면 됩니다:
 *     VITE_API_URL=http://백엔드_서버_IP:8080
 *  페이지 코드는 손대지 않아도 됩니다.
 */

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const USE_MOCK = !API_URL;

// 현재 로그인 사용자(데모용). 실제로는 인증에서 가져옵니다.
export const CURRENT_USER = "20230000";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// mock 댓글 저장소 (세션 동안만 유지)
let MOCK_COMMENTS: Comment[] = [
  { id: 1, postId: 2, author: "20211111", text: "혹시 카드 색이 파란색인가요?", date: "2026-06-29 13:10" },
  { id: 2, postId: 2, author: "20219876", text: "네 맞습니다! 쪽지 드릴게요.", date: "2026-06-29 13:25" },
];

/* ---------------- 게시글 ---------------- */

export async function getPosts(): Promise<Post[]> {
  if (USE_MOCK) {
    await delay(250);
    return [...MOCK_POSTS].sort((a, b) => b.date.localeCompare(a.date));
  }
  const res = await fetch(`${API_URL}/posts`);
  if (!res.ok) throw new Error("게시글 목록을 불러오지 못했습니다.");
  return res.json();
}

export async function getPost(id: number): Promise<Post | undefined> {
  if (USE_MOCK) {
    await delay(150);
    return MOCK_POSTS.find((p) => p.id === id);
  }
  const res = await fetch(`${API_URL}/posts/${id}`);
  if (!res.ok) throw new Error("게시글을 불러오지 못했습니다.");
  return res.json();
}

export async function createPost(data: NewPost): Promise<Post> {
  if (USE_MOCK) {
    await delay(300);
    const created: Post = {
      ...data,
      id: Date.now(),
      date: data.date || new Date().toISOString().slice(0, 10),
      author: CURRENT_USER,
      status: "open",
    };
    MOCK_POSTS.unshift(created);
    return created;
  }
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("글 등록에 실패했습니다.");
  return res.json();
}

// 상태 변경 (작성자가 "해결 완료"로 바꾸는 기능)
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
  return res.json();
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

/* ---------------- 댓글(문의) ---------------- */

export async function getComments(postId: number): Promise<Comment[]> {
  if (USE_MOCK) {
    await delay(150);
    return MOCK_COMMENTS.filter((c) => c.postId === postId);
  }
  const res = await fetch(`${API_URL}/posts/${postId}/comments`);
  if (!res.ok) throw new Error("댓글을 불러오지 못했습니다.");
  return res.json();
}

export async function addComment(postId: number, text: string): Promise<Comment> {
  if (USE_MOCK) {
    await delay(200);
    const c: Comment = {
      id: Date.now(),
      postId,
      author: CURRENT_USER,
      text,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    MOCK_COMMENTS.push(c);
    return c;
  }
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("댓글 등록에 실패했습니다.");
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
      (scope.title && p.title.toLowerCase().includes(q)) ||
      (scope.place && p.location.toLowerCase().includes(q)) ||
      (scope.content && p.desc.toLowerCase().includes(q))
    );
  });
}

export const apiMode = USE_MOCK ? "mock" : "live";
