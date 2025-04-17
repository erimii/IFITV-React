// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import RecommendationCarousel from '../components/RecommendationCarousel';
import { useNavigate } from 'react-router-dom';

function HomePage({ user, profile, onLogout }) {
  const navigate = useNavigate();

  const [genreContents, setGenreContents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 첫 진입 시 사용자 선호 장르 기반 콘텐츠 추천
  useEffect(() => {
    const fetchGenreContents = async () => {
      const response = await fetch("http://localhost:5000/profile_recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, profile_name: profile.name }),
      });
      const data = await response.json();
      console.log("서버 응답:", data);
      if (Array.isArray(data)) {
        setGenreContents(data);  // 🔥 배열이면 그대로 세팅
      } else {
        alert(data.error || "추천 실패");
        setGenreContents([]); // ⚠️ 안전하게 빈 배열로
      }
    };

    if (user) {
      fetchGenreContents();
    }
  }, [user]);

  // 콘텐츠 클릭 → 추천 결과 받아오기
  const handleClick = async (title) => {
    setLoading(true);
    const response = await fetch("http://localhost:5000/recommend_with_reason", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, top_n: 5, alpha: 0.7 }),
    });
    const data = await response.json();
    setResults(data);
    setIsModalOpen(true);
    setLoading(false);
  };

  // 캐러셀 내 “비슷한 콘텐츠 더 보기”
  const handleSimilarClick = async (title) => {
    setLoading(true);
    const response = await fetch("http://localhost:5000/recommend_with_reason", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, top_n: 5, alpha: 0.7 }),
    });
    const data = await response.json();
    setResults(data);
    setLoading(false);
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

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '12px',
            width: '80%', maxWidth: '600px', position: 'relative'
          }}>
            <button onClick={() => setIsModalOpen(false)} style={{
              position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer'
            }}>❌</button>

            <h2 style={{ textAlign: 'center' }}>✨ 추천 콘텐츠</h2>

            <RecommendationCarousel
              results={results}
              onSimilarClick={handleSimilarClick}
            />
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
