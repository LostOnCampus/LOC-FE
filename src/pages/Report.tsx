import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../types";

const wrap: React.CSSProperties = { maxWidth: 560, margin: "0 auto", padding: "44px 24px 60px" };

export default function Report() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; contact?: string; message?: string }>({});

  function submit() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "이름을 입력하세요.";
    if (!form.contact.trim()) e.contact = "연락처를 입력하세요.";
    if (!form.message.trim()) e.message = "내용을 입력하세요.";
    setErrors(e);
    if (Object.keys(e).length) return;
    // TODO: 제보 내용 서버 전송 (예: POST /posts/:id/reports)
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ ...wrap, textAlign: "center", paddingTop: 80 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.foundBg, color: C.found, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 20px" }}>
          ✓
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>제보가 전달되었어요</h1>
        <p style={{ color: C.sub, lineHeight: 1.6, marginBottom: 26 }}>
          작성자에게 제보 내용이 전달됩니다.<br />소중한 도움 감사합니다!
        </p>
        <button onClick={() => navigate(`/posts/${id}`)} style={{ background: C.brand, color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          게시글로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>제보하기</h1>
      <p style={{ color: C.sub, margin: "0 0 26px", lineHeight: 1.6 }}>
        물건을 봤거나 정보를 알고 있다면 알려주세요. 작성자에게 전달됩니다.
      </p>

      <Field label="이름" error={errors.name}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="이름 또는 닉네임" style={inputStyle} />
      </Field>
      <Field label="연락처" error={errors.contact}>
        <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="연락 가능한 전화번호 또는 이메일" style={inputStyle} />
      </Field>
      <Field label="내용" error={errors.message}>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="어디서 봤는지, 어떤 정보를 알고 있는지 적어주세요." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
      </Field>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={() => navigate(-1)} style={{ padding: "14px 24px", background: "#fff", color: "#55617a", border: `1px solid ${C.line}`, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          취소
        </button>
        <button onClick={submit} style={{ flex: 1, background: C.brand, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>
          제보 보내기
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#33415c", marginBottom: 8 }}>{label}</label>
      {children}
      {error && <p style={{ color: C.lost, fontSize: 12.5, margin: "6px 0 0" }}>{error}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 15px", borderRadius: 11, border: "1px solid #cfddf7", fontSize: 15, outline: "none" };
