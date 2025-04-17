import React, { useEffect, useState } from 'react';
import RecommendationCarousel from "./components/RecommendationCarousel";

function App() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [genreContents, setGenreContents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
      // 사용자 목록 불러오기
      fetch("http://localhost:5000/profiles")
      .then(res => res.json())
      .then(data => setProfiles(data));
  }, []);

  // 콘텐츠 클릭 시 추천 요청
  const handleClick = async (title) => {
    setLoading(true);
    const response = await fetch("http://localhost:5000/recommend_with_reason", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, top_n: 5, alpha: 0.7 }),
    });
    const data = await response.json();
    setResults(data);
    setIsModalOpen(true); // 모달 열기
    setLoading(false);
  };
  
  // 사용자 선택 시 해당 유저의 선호 장르 기반 콘텐츠 10개 불러오기
  const handleProfileSelect = async (username) => {
    setSelectedProfile(username);
    setResults([]); // 기존 추천 초기화
  
    const response = await fetch("http://localhost:5000/profile_recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await response.json();
    setGenreContents(data);
  };
  // 추천 캐러셀 안의 콘텐츠 중 하나 클릭 시 다시 추천
  const handleSimilarClick = async (title) => {
    setLoading(true);
    const response = await fetch("http://localhost:5000/recommend_with_reason", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, top_n: 5, alpha: 0.7 }),
    });
    const data = await response.json();
    setResults(data); // 캐러셀 내용 갱신
    setLoading(false);
  };


  return (
    <div style={{ padding: '2rem' }}>
      <h1>🎬 IFITV 예능 추천기</h1>

      <div style={{ marginBottom: '2rem' }}>
        <label>👤 사용자 선택: </label>
        <select onChange={(e) => handleProfileSelect(e.target.value)}>
          <option value="">-- 선택하세요 --</option>
          {profiles.map((p, idx) => (
            <option key={idx} value={p.username}>{p.username}</option>
          ))}
        </select>
      </div>

      <h2>👇 {selectedProfile}님의 선호 장르 기반 콘텐츠</h2>
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

export default App;
