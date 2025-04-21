// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import ContentModal from "../components/ContentModal";


function HomePage({ user, profile, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const likedContents = location.state?.liked_contents || [];
  const [genreContents, setGenreContents] = useState([]);
  const [livePrograms, setLivePrograms] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || !profile) return;
  
      // 1. 선호 장르 기반 콘텐츠
      const res1 = await fetch("http://localhost:5000/profile_recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, profile_name: profile.name }),
      });
      const genreData = await res1.json();
      if (Array.isArray(genreData)) {
        setGenreContents(genreData);
      } else {
        setGenreContents([]);
        alert(genreData.error || "선호 장르 콘텐츠 추천 실패");
      }
  
      // 2. 오늘 방송 추천
      const res2 = await fetch("http://localhost:5000/live_recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, profile_name: profile.name }),
      });
      const liveData = await res2.json();
      if (Array.isArray(liveData)) {
        setLivePrograms(liveData);
      } else {
        setLivePrograms([]);
      }
  
      // 3. liked_contents 기반 추천
      const likedContents = profile.liked_contents || [];
      if (likedContents.length > 0) {
        const res3 = await fetch("http://localhost:5000/initial_recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titles: likedContents }),
        });
        const personalizedData = await res3.json();
        if (Array.isArray(personalizedData)) {
          setPersonalized(personalizedData);
        } else {
          setPersonalized([]);
        }
      }
    };
  
    fetchRecommendations();
  }, [user, profile]);
  
  
  // 콘텐츠 클릭 → 디테일 + 비슷한 콘텐츠 추천
  const handleClick = async (title) => {
    setLoading(true);
    const response = await fetch("http://localhost:5000/recommend_with_detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, top_n: 5, alpha: 0.7 }),
    });
    const data = await response.json();
    setSelectedContent(data.info);
    setResults(data.recommendations);
    setIsModalOpen(true);
    setLoading(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div>
          <h1 style={{ marginBottom: '0.3rem' }}>🎬 IFITV 예능 추천기</h1>
          <p style={{ margin: 0 }}>
            현재 프로필: <strong style={{ color: "#A50034" }}>{profile.name}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => navigate("/select-profile")} style={subButtonStyle}>
            프로필 변경
          </button>
          <button onClick={onLogout} style={subButtonStyle}>
            로그아웃
          </button>
        </div>
      </div>

      <h2>👇 {profile.name}님의 선호 장르 기반 콘텐츠</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {genreContents.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(item.title)}
            style={{
              cursor: 'pointer',
              width: '150px',
              textAlign: 'center',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '0.5rem'
            }}
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              style={{ width: '100%', borderRadius: '4px' }}
            />
            <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{item.title}</p>
          </div>
        ))}
      </div>

      {loading && <p>추천 중입니다...</p>}

      <ContentModal
        content={selectedContent}
        recommendations={results}
        onClose={handleCloseModal}
      />

      {livePrograms.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>📺 {profile.name}님의 오늘 방송 추천</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {livePrograms.map((program, idx) => (
              <div key={idx} style={{
                width: '250px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1rem',
                background: '#fdfdfd'
              }}>
                <h4>{program["프로그램명"]}</h4>
                <p>⏰ {program["방송 시간"]}</p>
                <p>📡 {program["채널명"]}</p>
                <p>🎭 장르: {program["장르"]}</p>
                {program["출연진"] && <p>👤 출연: {program["출연진"]}</p>}
                {program["설명"] && <p>📝 {program["설명"]}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {personalized.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>💖 {profile.name}님이 좋아한 콘텐츠와 비슷한 추천</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {personalized.map((item, idx) => (
              <div key={idx} style={{
                width: '150px',
                textAlign: 'center',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '0.5rem'
              }}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{ width: '100%', borderRadius: '4px' }}
                />
                <p style={{ fontWeight: 'bold' }}>{item.title}</p>
                <p style={{ fontSize: "0.8rem", color: "#777" }}>{item.subgenre}</p>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}

const subButtonStyle = {
  backgroundColor: "#ddd",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold"
};

export default HomePage;
