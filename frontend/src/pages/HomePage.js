import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ContentModal from "../components/ContentModal";
import HorizontalSlider from '../components/HorizontalSlider';

function HomePage({ user, profile, onLogout }) {
  const navigate = useNavigate();

  const [genreContents, setGenreContents] = useState([]);
  const [livePrograms, setLivePrograms] = useState([]);
  const [likedRecommendationsByGenre, setLikedRecommendationsByGenre] = useState({
    드라마: [],
    예능: [],
    영화: []
  });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || !profile) return;

      setLoading(true);

      try {
        // 1. 선호 장르 기반 추천
        const res1 = await axios.post("http://localhost:8000/api/profile_recommend/", {
          username: user.username,
          profile_name: profile.name,
        });
        setGenreContents(Array.isArray(res1.data) ? res1.data : []);

        // 2. 실시간 방송 추천
        const res2 = await axios.post("http://localhost:8000/api/live_recommend/", {
          username: user.username,
          profile_name: profile.name,
        });
        setLivePrograms(Array.isArray(res2.data) ? res2.data : []);

        // 3. liked 기반 추천 (profile_id 기반)
        const res3 = await axios.post("http://localhost:8000/recommendation/liked_based_recommend/", {
          profile_id: profile.id
        });
        setLikedRecommendationsByGenre(res3.data);
      } catch (error) {
        console.error("추천 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, profile]);

  const handleClick = async (title) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/recommend_with_detail/", {
        title,
        top_n: 5,
        alpha: 0.7
      });
      setSelectedContent(res.data.info);
      setResults(res.data.recommendations);
      setIsModalOpen(true);
    } catch (error) {
      console.error("상세 추천 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  const handleLiveClick = (title, airtime) => {
    const now = new Date();
    let programTime;
  
    if (airtime.includes(" ")) {
      // '2025-05-15 16:30:00' 같은 포맷
      programTime = new Date(airtime);
    } else {
      // '16:30:00' 포맷 (오늘 날짜 기준으로 시간 세팅)
      const [hour, minute, second] = airtime.split(":").map(Number);
      programTime = new Date();
      programTime.setHours(hour);
      programTime.setMinutes(minute);
      programTime.setSeconds(second || 0);
    }
  
    if (programTime < now) {
      alert(`🔔 "${title}" 보러가기!`);
    } else {
      alert(`📅 "${title}" 시청 예약하기!`);
    }
  };
  

  return (
    <div style={{ padding: '2rem' }}>
      {/* 상단 바 */}
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

      {loading && <p>추천 중입니다...</p>}

      <ContentModal
        content={selectedContent}
        recommendations={results}
        onClose={handleCloseModal}
      />

      <HorizontalSlider
        title={`👇 ${profile.name}님의 선호 장르 기반 콘텐츠`}
        items={genreContents}
        onCardClick={handleClick}
      />

      {Object.entries(likedRecommendationsByGenre).map(([genre, items]) => (
        items.length > 0 && (
          <HorizontalSlider
            key={genre}
            title={`💖 ${profile.name}님을 위한 ${genre} 추천`}
            items={items}
            onCardClick={handleClick}
          />
        )
      ))}

      {livePrograms.length > 0 && (
        <HorizontalSlider
          title={`📺 ${profile.name}님의 오늘 방송 추천`}
          items={livePrograms.map((item) => ({
            title: item["title"],
            thumbnail: item["thumbnail"],
            airtime: item["airtime"],
          }))}
          onCardClick={handleLiveClick}
        />
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
