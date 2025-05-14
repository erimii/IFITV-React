import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddProfileForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    preferred_genres: {},  // 장르별 서브장르 이름 (화면용)
  });

  const [subgenreMapping, setSubgenreMapping] = useState({});  // { "예능": [{id, name}], ... }
  const [selectedSubgenreIds, setSelectedSubgenreIds] = useState([]);  // 최종 id 리스트

  // ✅ 서브장르 리스트 가져오기 (id + name)
  useEffect(() => {
    axios.get('http://localhost:8000/recommendation/subgenres/')
      .then(res => {
        setSubgenreMapping(res.data);
      })
      .catch(err => {
        console.error("서브장르 불러오기 실패", err);
      });
  }, []);

  // ✅ 서브장르 토글 (name & id 둘 다 처리)
  const toggleSubgenre = (genre, subgenreObj) => {
    const { id: subgenreId, name: subgenreName } = subgenreObj;

    // preferred_genres (name 기준)
    setForm((prev) => {
      const selectedNames = prev.preferred_genres[genre] || [];
      const isSelected = selectedNames.includes(subgenreName);

      const updatedNames = isSelected
        ? selectedNames.filter((s) => s !== subgenreName)
        : [...selectedNames, subgenreName];

      return {
        ...prev,
        preferred_genres: {
          ...prev.preferred_genres,
          [genre]: updatedNames,
        },
      };
    });

    // selectedSubgenreIds (id 기준)
    setSelectedSubgenreIds((prev) =>
      prev.includes(subgenreId)
        ? prev.filter((id) => id !== subgenreId)
        : [...prev, subgenreId]
    );
  };

  // ✅ 최종 제출 (id 리스트 포함해서 넘김)
  const handleSubmit = (e) => {
    e.preventDefault();

    const profileData = {
      ...form,
      preferred_subgenres: selectedSubgenreIds,  // ✅ 서버로 넘길 id 리스트
      liked_contents_ids: []  // 다음 페이지에서 채울 거니까 비워둠
    };

    console.log("최종 profileData:", profileData);

    navigate("/select-content", { state: { profile: profileData } });
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
                  key={sub.id}
                  onClick={() => toggleSubgenre(genre, sub)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: (form.preferred_genres[genre] || []).includes(sub.name)
                      ? "2px solid #A50034"
                      : "1px solid #ccc",
                    borderRadius: "999px",
                    cursor: "pointer",
                  }}
                >
                  #{sub.name}
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
