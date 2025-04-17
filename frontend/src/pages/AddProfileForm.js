import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddProfileForm({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    preferred_genres: [],
  });

  const allGenres = ["오락", "버라이어티", "리얼리티", "힐링예능", "음악예능", "에니멀", "쿡방/먹방", "여행", "토크쇼", "스포츠예능"];

  const toggleGenre = (genre) => {
    setForm((prev) => ({
      ...prev,
      preferred_genres: prev.preferred_genres.includes(genre)
        ? prev.preferred_genres.filter((g) => g !== genre)
        : [...prev.preferred_genres, genre],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/select-content", { state: { profile: form } });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>➕ 새 프로필 만들기</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="닉네임" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="나이" required value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option value="">성별 선택</option>
          <option value="여">여</option>
          <option value="남">남</option>
        </select>

        <h4>선호 장르</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {allGenres.map((g) => (
            <div
              key={g}
              onClick={() => toggleGenre(g)}
              style={{
                padding: "0.5rem 1rem",
                border: form.preferred_genres.includes(g) ? "2px solid #A50034" : "1px solid #ccc",
                borderRadius: "999px",
                cursor: "pointer"
              }}
            >
              #{g}
            </div>
          ))}
        </div>

        <button type="submit" style={{ marginTop: "1rem", padding: "1rem", background: "#A50034", color: "white", border: "none", borderRadius: "8px" }}>
          다음 ➡️
        </button>
      </form>
    </div>
  );
}

export default AddProfileForm;
