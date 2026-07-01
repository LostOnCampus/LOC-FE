// ============================================================
//  백엔드 DB(ddl.sql) ENUM 값에 맞춘 데이터 모델
//  내부 값은 백엔드와 동일한 영문 대문자, 화면 표시는 한글 라벨로 매핑
// ============================================================

export type PostType = "LOST" | "FOUND"; // posts.type ENUM
export type PostStatus = "PROCESS" | "COMPLETED"; // posts.status ENUM
export type Category =
  | "ELECTRONIC"
  | "WALLETS"
  | "IDS"
  | "CLOTHING"
  | "BOOKS"
  | "OTHERS"; // posts.category ENUM

// ---- 화면 표시용 한글 라벨 ----
export const TYPE_LABEL: Record<PostType, string> = {
  LOST: "분실물",
  FOUND: "습득물",
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  PROCESS: "찾는 중",
  COMPLETED: "해결 완료",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  ELECTRONIC: "전자기기",
  WALLETS: "지갑/카드",
  IDS: "신분증",
  CLOTHING: "의류",
  BOOKS: "도서",
  OTHERS: "기타",
};

// 글쓰기 select 용 (코드 + 한글 라벨)
export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABEL) as Category[]).map(
  (code) => ({ code, label: CATEGORY_LABEL[code] })
);

// posts 테이블 (+ users 조인으로 작성자 학번 표시)
export interface Post {
  id: number; // posts.id
  userId: number; // posts.user_id (FK → users.id)
  authorStudentId?: string; // users.student_id (조인해서 내려주는 값, 표시용)
  type: PostType; // posts.type  (LOST/FOUND)
  title: string; // posts.title
  itemName: string; // posts.item_name
  category: Category; // posts.category
  location: string; // posts.location
  eventDate: string; // posts.event_date ("2026-06-29")
  description: string; // posts.description
  imageUrl?: string; // posts.image_url (한 장, varchar 255)
  status: PostStatus; // posts.status (PROCESS/COMPLETED)
  createdAt?: string; // posts.created_at
  updatedAt?: string; // posts.updated_at
}

// comments 테이블
export interface Comment {
  id: number;
  postId: number;
  userId: number;
  authorStudentId?: string;
  content: string;
  createdAt: string;
}

// inquiries 테이블 (문의 폼)
export interface Inquiry {
  id: number;
  name: string;
  phone: string;
  message: string;
  createdAt?: string;
}

// 글 작성 시 서버로 보낼 데이터 (id/userId/status/날짜는 서버가 채움)
export type NewPost = Omit<
  Post,
  "id" | "userId" | "authorStudentId" | "status" | "createdAt" | "updatedAt"
>;

export type NewInquiry = Omit<Inquiry, "id" | "createdAt">;

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
