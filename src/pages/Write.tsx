import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { C, CATEGORY_OPTIONS } from "../types";
import type { PostType, Category } from "../types";
import { createPost, updatePost, getPost, uploadImage } from "../api/posts";
import { getCurrentUser } from "../api/auth";

const wrap: React.CSSProperties = { maxWidth: 720, margin: "0 auto", padding: "34px 24px 60px" };
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function Write() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit"); // 있으면 수정 모드
  const isEdit = !!editId;
  const initialType = (params.get("type") as PostType) || "LOST";

  const currentUser = getCurrentUser();

  const [type, setType] = useState<PostType>(initialType);
  const [category, setCategory] = useState<Category>(CATEGORY_OPTIONS[0].code);
  const [title, setTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  // 이미지: 기존 URL(수정 시) 또는 새로 고른 파일
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [newImage, setNewImage] = useState<{ url: string; file: File } | null>(null);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 수정 모드: 기존 글 내용 불러와서 폼 채우기
  useEffect(() => {
    if (!isEdit) return;
    getPost(Number(editId))
      .then((p) => {
        if (!p) {
          setError("수정할 게시글을 찾을 수 없습니다.");
          return;
        }
        setType(p.type);
        setCategory(p.category);
        setTitle(p.title);
        setItemName(p.itemName);
        setEventDate(p.eventDate);
        setLocation(p.location);
        setDescription(p.description);
        setExistingImageUrl(p.imageUrl ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "불러오기 실패"))
      .finally(() => setLoadingPost(false));
  }, [isEdit, editId]);

  // 로그인 안 했으면 안내 (모든 훅 선언 이후 분기)
  if (!currentUser) {
    return (
      <div style={{ ...wrap, textAlign: "center", paddingTop: 80 }}>
        <p style={{ fontSize: 16, color: C.sub, marginBottom: 20 }}>글을 등록하려면 로그인이 필요해요.</p>
        <button onClick={() => navigate("/auth")} style={{ background: C.brand, color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          로그인하러 가기
        </button>
      </div>
    );
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) {
      setError("JPG, PNG 형식만 올릴 수 있어요.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("파일은 5MB 이하만 올릴 수 있어요.");
      return;
    }
    setError("");
    if (newImage) URL.revokeObjectURL(newImage.url);
    setNewImage({ url: URL.createObjectURL(file), file });
  }

  function removeImage() {
    if (newImage) URL.revokeObjectURL(newImage.url);
    setNewImage(null);
    setExistingImageUrl(""); // 기존 이미지도 제거
  }

  async function submit() {
    if (!title.trim() || !itemName.trim() || !location.trim() || !eventDate) {
      setError("제목, 물품명, 날짜, 장소는 필수입니다.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // 새 이미지를 골랐으면 먼저 업로드해서 URL 받기, 아니면 기존 URL 유지
      let imageUrl = existingImageUrl;
      if (newImage) {
        imageUrl = await uploadImage(newImage.file);
      }
      const payload = { type, category, title, itemName, eventDate, location, description, imageUrl };
      const result = isEdit
        ? await updatePost(Number(editId), payload)
        : await createPost(payload);
      navigate(`/posts/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingPost) return <div style={wrap}>불러오는 중…</div>;

  const previewUrl = newImage?.url || existingImageUrl;

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 22px" }}>{isEdit ? "글 수정" : "글 등록"}</h1>

      <Field label="유형 *">
        <div style={{ display: "flex", gap: 10 }}>
          <Seg active={type === "LOST"} color={C.lost} bg={C.lostBg} onClick={() => setType("LOST")}>
            분실물 (잃어버렸어요)
          </Seg>
          <Seg active={type === "FOUND"} color={C.found} bg={C.foundBg} onClick={() => setType("FOUND")}>
            습득물 (주웠어요)
          </Seg>
        </div>
      </Field>

      <Field label="제목 *">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예) 중앙도서관에서 검정 에어팟 케이스 분실" style={inputStyle} />
      </Field>

      <Field label="물품명 *">
        <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="예) 에어팟 프로 케이스" style={inputStyle} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="분류 *">
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} style={inputStyle}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="날짜 *">
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={inputStyle} />
        </Field>
      </div>

      <Field label="장소 *">
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="예) 중앙도서관 3층 열람실" style={inputStyle} />
      </Field>

      <Field label="상세 설명">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="물건의 특징, 발견·분실 상황 등을 적어주세요."
          rows={6}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        />
      </Field>

      <Field label="사진 업로드">
        <div style={{ display: "flex", gap: 12 }}>
          {!previewUrl ? (
            <label style={{ width: 120, height: 120, borderRadius: 14, border: `1.5px dashed #b7c8ee`, background: "#f6f9ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: C.brand, cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}>
              <span style={{ fontSize: 24, fontWeight: 400, lineHeight: 1 }}>+</span>
              사진 추가
              <input type="file" accept="image/jpeg,image/png" onChange={onPickImage} style={{ display: "none" }} />
            </label>
          ) : (
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14, border: `1px solid ${C.line}` }} />
              <button onClick={removeImage} aria-label="삭제" style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(30,40,60,0.65)", color: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>
          )}
        </div>
        <p style={{ fontSize: 12.5, color: C.muted, margin: "10px 0 0" }}>JPG, PNG 형식 · 5MB 이하 · 1장</p>
      </Field>

      {error && <p style={{ color: C.lost, fontSize: 14, marginBottom: 14 }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={() => navigate(-1)} style={ghostBtn}>취소</button>
        <button onClick={submit} disabled={submitting} style={{ ...primaryBtn, opacity: submitting ? 0.6 : 1 }}>
          {submitting ? "저장 중…" : isEdit ? "수정하기" : "등록하기"}
        </button>
      </div>
    </div>
  );
}

function Seg({ active, color, bg, onClick, children }: { active: boolean; color: string; bg: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1.5px solid ${active ? color : C.line}`, background: active ? bg : "#fff", color: active ? color : "#7a869e", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#33415c", marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 15px", borderRadius: 11, border: `1px solid #cfddf7`, background: "#fff", fontSize: 15, outline: "none" };
const primaryBtn: React.CSSProperties = { flex: 1, background: C.brand, color: "#fff", border: "none", borderRadius: 12, padding: "15px", fontSize: 16, fontWeight: 700, cursor: "pointer" };
const ghostBtn: React.CSSProperties = { padding: "15px 24px", background: "#fff", color: "#55617a", border: `1px solid ${C.line}`, borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" };
