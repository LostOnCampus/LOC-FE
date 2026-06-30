import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../types";

const wrap: React.CSSProperties = { maxWidth: 420, margin: "0 auto", padding: "50px 24px 60px" };

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [sid, setSid] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!sid.trim() || !pw.trim()) {
      setError("학번과 비밀번호를 입력하세요.");
      return;
    }
    // TODO: 실제 인증 API 연동 지점 (api/auth.ts 등으로 분리 추천)
    setError("");
    navigate("/");
  }

  return (
    <div style={wrap}>
      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: "34px 30px", boxShadow: "0 4px 20px rgba(20,30,60,0.06)" }}>
        {/* 탭 */}
        <div style={{ display: "flex", gap: 0, marginBottom: 26, borderBottom: `1px solid ${C.line}` }}>
          <TabBtn active={tab === "login"} onClick={() => setTab("login")}>로그인</TabBtn>
          <TabBtn active={tab === "signup"} onClick={() => setTab("signup")}>회원가입</TabBtn>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>학번</label>
          <input value={sid} onChange={(e) => setSid(e.target.value)} placeholder="예: 20231234" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>비밀번호</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" style={inputStyle} />
        </div>
        {tab === "signup" && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>비밀번호 확인</label>
            <input type="password" placeholder="비밀번호 확인" style={inputStyle} />
          </div>
        )}

        {error && <p style={{ color: C.lost, fontSize: 13.5, marginBottom: 12 }}>{error}</p>}

        <button
          onClick={submit}
          style={{ width: "100%", background: C.brand, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15.5, fontWeight: 700, cursor: "pointer", marginTop: 6 }}
        >
          {tab === "login" ? "로그인" : "회원가입"}
        </button>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: "none",
        border: "none",
        borderBottom: `2px solid ${active ? C.brand : "transparent"}`,
        color: active ? C.brand : C.muted,
        fontSize: 15,
        fontWeight: 700,
        padding: "10px 0 14px",
        cursor: "pointer",
        marginBottom: -1,
      }}
    >
      {children}
    </button>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: "#33415c", marginBottom: 7 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #cfddf7", fontSize: 15, outline: "none" };
