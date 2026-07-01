import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { C } from "../types";
import { getCurrentUser, logout, subscribe } from "../api/auth";
import type { AuthUser } from "../api/auth";

const SITE_NAME = "다시봄 · 분실물 센터";

function navStyle(active: boolean): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: active ? 700 : 500,
    color: active ? C.brand : "#55617a",
    padding: "8px 0",
    textDecoration: "none",
  };
}

export function Header() {
  const navigate = useNavigate();
  // 로그인 상태 (localStorage 기반, 변경 시 자동 갱신)
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  useEffect(() => subscribe(() => setUser(getCurrentUser())), []);
  const loggedIn = !!user;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e6eaf2",
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 24px",
          height: 66,
          display: "flex",
          alignItems: "center",
          gap: 30,
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `linear-gradient(135deg,${C.brand},${C.brandSoft})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            다
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {SITE_NAME}
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <NavLink to="/" end style={({ isActive }) => navStyle(isActive)}>
            홈
          </NavLink>
          <NavLink to="/posts" style={({ isActive }) => navStyle(isActive)}>
            분실물·습득물
          </NavLink>
          <NavLink to="/search" style={({ isActive }) => navStyle(isActive)}>
            검색
          </NavLink>
          <NavLink to="/write" style={({ isActive }) => navStyle(isActive)}>
            글쓰기
          </NavLink>
        </nav>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {loggedIn ? (
            <>
              <span style={{ fontSize: 13.5, color: "#55617a" }}>
                <b style={{ color: C.text }}>{user!.name}</b>님
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                style={{
                  background: "#fff",
                  color: "#55617a",
                  border: "1px solid #e0e5ee",
                  borderRadius: 10,
                  padding: "9px 14px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              style={{
                background: "#fff",
                color: C.brand,
                border: "1px solid #cfddf7",
                borderRadius: 10,
                padding: "9px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              로그인
            </button>
          )}
          <button
            onClick={() => navigate("/write")}
            style={{
              background: C.brand,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(47,111,237,0.25)",
            }}
          >
            + 글 등록
          </button>
        </div>
      </div>
    </header>
  );
}
