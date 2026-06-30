// ============================================================
//  백엔드 ER 다이어그램에 맞춘 데이터 모델
//  (posts / users / comments / inquiries)
// ============================================================

export type PostType = "lost" | "found"; // posts.type ENUM
export type PostStatus = "open" | "resolved"; // posts.status ENUM

// posts 테이블 (+ users 조인으로 작성자 학번 표시)
export interface Post {
  id: number; // posts.id
  userId: number; // posts.user_id (FK → users.id)
  authorStudentId?: string; // users.student_id (조인해서 내려주는 값, 표시용)
  type: PostType; // posts.type
  title: string; // posts.title
  itemName: string; // posts.item_name  ← 새로 추가
  category: string; // posts.category (ENUM)
  location: string; // posts.location
  eventDate: string; // posts.event_date ("2026-06-29")
  description: string; // posts.description
  imageUrl?: string; // posts.image_url (한 장)
  status: PostStatus; // posts.status
  createdAt?: string; // posts.created_at
  updatedAt?: string; // posts.updated_at
}

// comments 테이블
export interface Comment {
  id: number; // comments.id
  postId: number; // comments.post_id
  userId: number; // comments.user_id
  authorStudentId?: string; // users.student_id (표시용)
  content: string; // comments.content
  createdAt: string; // comments.created_at
}

// inquiries 테이블 (제보/문의 — 게시글과 별개의 연락 폼)
export interface Inquiry {
  id: number;
  name: string; // inquiries.name
  phone: string; // inquiries.phone
  message: string; // inquiries.message
  createdAt?: string; // inquiries.created_at
}

// 글 작성 시 서버로 보낼 데이터 (id/userId/status/날짜는 서버가 채움)
export type NewPost = Omit<
  Post,
  "id" | "userId" | "authorStudentId" | "status" | "createdAt" | "updatedAt"
>;

// 문의 작성 시 보낼 데이터
export type NewInquiry = Omit<Inquiry, "id" | "createdAt">;

// 카테고리 ENUM 후보 (백엔드 category ENUM 값과 동일하게 유지)
export const CATEGORIES = ["전자기기", "지갑/카드", "의류", "신분증", "기타"];

// 디자인 토큰
export const C = {
  brand: "#2f6fed",
  brandSoft: "#5b8df5",
  bg: "#f3f5fa",
  text: "#1a2233",
  sub: "#5a6678",
  muted: "#8a96ad",
  line: "#e8ecf4",
  lost: "#d64545",
  lostBg: "#fdecec",
  found: "#1f9d6b",
  foundBg: "#e6f6ee",
};
