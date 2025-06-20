import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

function SelectContentPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;
  console.log("최종 profile:", profile);
  const [contentsByGenre, setContentsByGenre] = useState({});
  const [selectedContentIds, setSelectedContentIds] = useState([]);  // id로 관리
  const [selectedTitles, setSelectedTitles] = useState([]);  // UI 표시용

  const fetchContents = async () => {
    try {
      const response = await axios.post("http://localhost:8000/recommendation/sample_contents/", {
        selected: profile.preferred_genres,
        profile_id: profile.id,
      });
      console.log("콘텐츠 불러오기 성공:", response.data);
      setContentsByGenre(response.data);
    } catch (error) {
      console.error('콘텐츠 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [profile]);

  const toggleContent = (content) => {
    const { id, title } = content;

    setSelectedContentIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );

    setSelectedTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleFinish = async () => {
    const fullProfile = {
      ...profile,
      liked_contents: selectedTitles,
      liked_contents_ids: selectedContentIds
    };

    console.log("최종 전송 데이터:", {
      user_id: user.id,
      profile: fullProfile
    });

    try {
      await axios.post("http://localhost:8000/api/add_profile/", {
        user_id: user.id,
        profile: fullProfile
      });
      navigate("/select-profile");
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      alert("프로필 저장 실패");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{profile.name}님의 취향 콘텐츠를 골라주세요!</h2>

      {Object.entries(contentsByGenre).map(([genre, items]) => (
        <div key={genre} style={{ marginBottom: "2rem" }}>
          <h3>
            {genre} 
            {profile.preferred_genres[genre] && profile.preferred_genres[genre].length > 0 && (
              <span>({profile.preferred_genres[genre].join(', ')})</span>
            )}
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleContent(item)}
                style={{
                  border: selectedContentIds.includes(item.id) ? "2px solid #A50034" : "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "0.5rem",
                  width: "150px",
                  cursor: "pointer"
                }}
              >
                <img src={item.thumbnail} alt={item.title} style={{ width: "100%", borderRadius: "6px" }} />
                <p style={{ fontWeight: "bold", marginTop: "0.5rem" }}>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleFinish}
        style={{
          backgroundColor: "#A50034",
          color: "white",
          padding: "0.5rem 1.2rem",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "2rem"
        }}
      >
        선택 완료 ➡️
      </button>
    </div>
  );
}

export default SelectContentPage;
