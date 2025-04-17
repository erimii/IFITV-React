import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function SelectContentPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;
  const [contents, setContents] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState([]);

  useEffect(() => {
    const fetchPreviewContents = async () => {
      const res = await fetch("http://localhost:5000/preview_recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferred_genres: profile.preferred_genres
        })
      });
      const data = await res.json();
      console.log("🎯 preview_recommend 응답:", data);
      setContents(data);
    };
  
    fetchPreviewContents();
  }, [profile]);
  

  const toggleContent = (title) => {
    setSelectedTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleFinish = async () => {
    const fullProfile = {
      ...profile,
      liked_contents: selectedTitles
    };

    await fetch("http://localhost:5000/add_profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        profile: fullProfile
      })
    });

    // 다시 프로필 선택 페이지로 이동
    navigate("/select-profile");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>✨ {profile.name}님의 취향 콘텐츠를 골라주세요!</h2>
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
        style={{
          marginTop: "2rem",
          padding: "1rem 2rem",
          fontSize: "1rem",
          backgroundColor: "#A50034",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        선택 완료 ➡️
      </button>
    </div>
  );
}

export default SelectContentPage;
