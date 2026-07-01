// ============================================================
//  로그인 / 사용자 관리
//  로그인 = 학번 + 이름 전송 → 백엔드가 DB에 없으면 생성, 있으면 로그인
//  (비밀번호 없음 — 백엔드 로직에 맞춤)
// ============================================================

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const USE_MOCK = !API_URL;

// 백엔드 로그인 엔드포인트. Swagger에서 정확한 경로 확인 후 이 값만 맞추면 됩니다.
// (예: "/users/login", "/login", "/auth/login" 등)
const LOGIN_ENDPOINT = "/users/login";

const STORAGE_KEY = "loc_user";

export interface AuthUser {
  id: number; // users.id
  studentId: string; // users.student_id (학번)
  name: string; // users.name
}

/* ---- 로그인 상태 변경 구독 (Header 등 UI 갱신용) ---- */
type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(cb: Listener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function notify() {
  listeners.forEach((l) => l());
}

/* ---- 현재 로그인 사용자 ---- */
export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  notify();
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

/* ---- 백엔드 응답(user) → AuthUser 변환 (snake/camel 모두 대응) ---- */
/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeUser(r: any): AuthUser {
  return {
    id: r.id,
    studentId: r.student_id ?? r.studentId ?? "",
    name: r.name ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ---- 로그인 (없으면 생성 / 있으면 로그인) ---- */
export async function login(studentId: string, name: string): Promise<AuthUser> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    // mock: 학번을 숫자화해서 임시 id 부여
    const user: AuthUser = {
      id: Number(studentId.replace(/\D/g, "").slice(-5)) || Date.now() % 100000,
      studentId,
      name,
    };
    saveUser(user);
    return user;
  }

  const res = await fetch(`${API_URL}${LOGIN_ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // 백엔드 UserLoginRequest 필드에 맞춤 (studentId, name)
    body: JSON.stringify({ studentId, name }),
  });
  if (!res.ok) throw new Error("로그인에 실패했습니다.");

  // 백엔드가 토큰을 헤더로 준다면 여기서 꺼내서 저장할 수 있음:
  //   const token = res.headers.get("Authorization");
  //   if (token) localStorage.setItem("loc_token", token);
  const user = normalizeUser(await res.json());
  saveUser(user);
  return user;
}
