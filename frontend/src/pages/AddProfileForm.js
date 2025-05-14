import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddProfileForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    preferred_genres: {},  // 장르별 서브장르 선택 결과
  });

  const [subgenreMapping, setSussbgenreMapping] = useState({});

  // subgenre_mapping 불러오기
  useEffect(() => {
    axios.get('http://localhost:8000/recommendation/subgenres/')
      .then(res => {
        setSussbgenreMapping(res.data);
      })
      .catch(err => {
        console.error("subgenre_mapping 불러오기 실패", err);
      });
  }, []);

  const toggleSubgenre = (genre, subgenre) => {
    setForm((prev) => {
      const selectedSubs = prev.preferred_genres[genre] || [];
  
      const normalizedSub = String(subgenre).trim();
  
      const isSelected = selectedSubs.includes(normalizedSub);
  
      const updatedSubs = isSelected
        ? selectedSubs.filter((s) => String(s).trim() !== normalizedSub)
        : [...selectedSubs, normalizedSub];
  
      const updatedPreferredGenres = {
        ...prev.preferred_genres,
        [genre]: updatedSubs,
      };
  
      const updatedForm = {
        ...prev,
        preferred_genres: updatedPreferredGenres,
      };
  
      console.log("업데이트된 form:", updatedForm);
  
      return updatedForm;
    });
  };
  
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("최종 프로필 데이터:", form);
    navigate("/select-content", { state: { profile: form } });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>➕ 새 프로필 만들기</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="닉네임"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="나이"
          required
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="">성별 선택</option>
          <option value="여">여</option>
          <option value="남">남</option>
        </select>

        <h4>선호 서브장르 선택</h4>
        {Object.entries(subgenreMapping).map(([genre, subgenres]) => (
          <div key={genre} style={{ marginTop: "1rem" }}>
            <h5>{genre}</h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {subgenres.map((sub) => (
                <div
                  key={sub}
                  onClick={() => toggleSubgenre(genre, sub)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: (form.preferred_genres[genre] || []).includes(sub)
                      ? "2px solid #A50034"
                      : "1px solid #ccc",
                    borderRadius: "999px",
                    cursor: "pointer",
                  }}
                >
                  #{sub}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          type="submit"
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#A50034",
            color: "white",
            border: "none",
            borderRadius: "8px",
          }}
        >
          다음 ➡️
        </button>
      </form>
    </div>
  );
}

export default AddProfileForm;
