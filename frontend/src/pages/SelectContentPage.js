import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';

function SelectContentPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;
  const [contents, setContents] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState([]);

  // 추천 콘텐츠 불러오기 함수 (중복 제거, axios 적용)
  const fetchPreviewContents = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/preview_recommend_model/", {
        preferred_genres: profile.preferred_genres
      });
      setContents(response.data);
    } catch (error) {
      console.error('추천 콘텐츠 불러오기 오류:', error);
    }
  };

  useEffect(() => {
    fetchPreviewContents();
  }, [profile]);

  // 콘텐츠 선택
  const toggleContent = (title) => {
    setSelectedTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  // 프로필 저장 API 호출 (axios 적용)
  const handleFinish = async () => {
    const fullProfile = {
      ...profile,
      liked_contents: selectedTitles
    };

    console.log("profile 데이터 확인...디비에 왜 깨져서 저장되니?", fullProfile);

    try {
      await axios.post("http://localhost:8000/api/add_profile/", {
        username: user.username,
        profile: fullProfile
      });
      navigate("/select-profile");
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      if (error.response) {
        alert(error.response.data.error || "프로필 저장 실패");
      } else {
        alert("서버 연결 오류");
      }
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{profile.name}님의 취향 콘텐츠를 골라주세요!</h2>
      <button onClick={fetchPreviewContents} style={ButtonStyle}>
        🔄 다른 콘텐츠 추천 받기
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {contents.map((item, idx) => (
          <div
            key={idx}
            onClick={() => toggleContent(item.title)}
            style={{
              border: selectedTitles.includes(item.title) ? "3px solid #A50034" : "1px solid #ccc",
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

      <button
        onClick={handleFinish}
        style={ButtonStyle}
      >
        선택 완료 ➡️
      </button>
    </div>
  );
}

const ButtonStyle = {
  backgroundColor: "#A50034",
  color: "white",
  padding: "0.5rem 1.2rem",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: "2rem",
  marginTop: "2rem",
};

export default SelectContentPage;
