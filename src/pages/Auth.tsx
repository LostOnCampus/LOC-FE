import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../types";
import { login } from "../api/auth";

const wrap: React.CSSProperties = { maxWidth: 420, margin: "0 auto", padding: "60px 24px" };

export default function Auth() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!studentId.trim() || !name.trim()) {
      setError("학번과 이름을 모두 입력하세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(studentId.trim(), name.trim());
      navigate("/"); // 로그인(또는 자동 가입) 성공 → 홈으로
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: "36px 30px", boxShadow: "0 4px 20px rgba(20,30,60,0.06)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", textAlign: "center" }}>로그인</h1>
        <p style={{ fontSize: 13.5, color: C.sub, textAlign: "center", margin: "0 0 26px", lineHeight: 1.5 }}>
          학번과 이름으로 로그인하세요.<br />처음이면 자동으로 가입됩니다.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>학번</label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="예) 20231234"
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) submit();
            }}
            placeholder="예) 홍길동"
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: C.lost, fontSize: 13.5, margin: "0 0 12px" }}>{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            background: C.brand,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "14px",
            fontSize: 15.5,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 6,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "확인 중…" : "로그인"}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: "#33415c", marginBottom: 7 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #cfddf7", fontSize: 15, outline: "none" };
