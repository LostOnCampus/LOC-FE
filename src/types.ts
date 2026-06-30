// 분실물 게시판에서 다루는 핵심 데이터 모델.
// 백엔드 API의 응답 형태도 이 타입에 맞추면 프론트 코드를 거의 안 바꿔도 됩니다.

export type PostType = "lost" | "found"; // 분실물 / 습득물
export type PostStatus = "open" | "resolved"; // 찾는 중 / 해결 완료

export interface Post {
  id: number;
  type: PostType;
  category: string; // 예: "전자기기", "지갑/카드"
  title: string;
  location: string; // 분실/습득 장소
  date: string; // "2026-06-28" 형태
  author: string; // 작성자 (학번/닉네임)
  desc: string; // 상세 설명
  status: PostStatus; // 진행 상태
  images?: string[]; // 사진 URL 목록 (없을 수도 있음)
}

// 댓글(문의)
export interface Comment {
  id: number;
  postId: number;
  author: string;
  text: string;
  date: string; // "2026-06-30 14:20" 형태
}

// 새 글 작성 시 서버로 보낼 데이터.
// id, author, status 는 서버가 채우고, 나머지(날짜·사진 포함)는 사용자가 입력합니다.
export type NewPost = Omit<Post, "id" | "author" | "status">;

// 디자인 토큰 — 목업의 색상을 한곳에서 관리
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
