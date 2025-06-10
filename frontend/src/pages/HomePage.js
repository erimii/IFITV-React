import React, { useEffect, useState, useRef  } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ContentModal from "../components/ContentModal";
import HorizontalSlider from '../components/HorizontalSlider';
import SideNav from '../components/SideNav';

function HomePage({ user, profile, onLogout }) {
  const navigate = useNavigate();

  const [selectedMenu, setSelectedMenu] = useState('홈');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedMenuParam = queryParams.get('menu') || '홈';
  const [vodContents, setVodContents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const loaderRef = useRef();

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
  const [myListContents, setMyListContents] = useState([]);
  const [watchedContentIds, setWatchedContentIds] = useState([]);

  
  // 네브 바 선택 시 바뀌게
  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
  
      if (selectedMenuParam === "VOD") {
        if (!hasNext) return;
        const res = await axios.get(`http://localhost:8000/recommendation/all_vod_contents/?page=${page}`);
        setVodContents(prev => [...prev, ...res.data.results]);
        setHasNext(res.data.has_next);
      }
  
      if (selectedMenuParam === "My List") {
        try {
          const res = await axios.get(`http://localhost:8000/api/my_list/?profile_id=${profile.id}`);
          setMyListContents(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error("My List 불러오기 오류:", error);
        }
      }
    };
  
    fetchData();
  }, [selectedMenuParam, page, profile]);

  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (!profile) return;
      try {
        const res = await axios.get(`http://localhost:8000/recommendation/watch_history/?profile_id=${profile.id}`);
        const ids = res.data.map(item => item.content_id);
        setWatchedContentIds(ids);
      } catch (error) {
        console.error("시청 이력 불러오기 실패:", error);
      }
    };
  
    fetchWatchHistory();
  }, [profile]);
  
  
  

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNext) {
        setPage(prev => prev + 1);
      }
    });
  
    const target = loaderRef.current;
  
    if (target) {
      observer.observe(target);
    }
  
    return () => {
      if (target) {
        observer.unobserve(target); 
      }
    };
  }, [hasNext, vodContents]);
  

  useEffect(() => {
    if (selectedMenuParam === "VOD") {
      setVodContents([]);  
      setPage(1);             
      setHasNext(true);      
    }
  }, [selectedMenuParam]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || !profile) return;

      setLoading(true);

      try {

        // 1. 선호 장르 기반 추천
        const res1 = await axios.post("http://localhost:8000/recommendation/subgenre_based_recommend/", {
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
  }, [user, profile, location.search]);

  const handleClick = async (title) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/recommend_with_detail/", {
        title,
        top_n: 5,
        alpha: 0.7,
        profile_id: profile.id
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

      <div style={{ display: 'flex' }}>
        <SideNav selectedMenu={selectedMenu} onSelect={setSelectedMenu} />
      
      <div style={{ padding: '2rem' }}>

      {loading && <p>...loading...</p>}

      <ContentModal
        content={selectedContent}
        recommendations={results}
        onClose={handleCloseModal}
        profile={profile}
        watchedContentIds={watchedContentIds}
        setWatchedContentIds={setWatchedContentIds}
      />

      {selectedMenuParam === "홈" && (
        <>
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
        </>
      )}

      {selectedMenuParam === "VOD" && (
        <>
          <h2 style={{ fontWeight: "bold", marginBottom: "1rem" }}>전체 VOD 콘텐츠</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem'
          }}>
            {vodContents.map((content, idx) => (
              <div key={idx} style={{ cursor: 'pointer' }} onClick={() => handleClick(content.title)}>
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
                <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>{content.title}</p>
              </div>
            ))}
          </div>
          <div ref={loaderRef} style={{ height: "1px" }} />
        </>
      )}

      {selectedMenuParam === "My List" && (
        <>
          <h2 style={{ fontWeight: "bold", marginBottom: "1rem" }}>💖 찜한 콘텐츠</h2>
          {myListContents.length === 0 ? (
            <p>아직 좋아요한 콘텐츠가 없습니다.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1rem'
            }}>
              {myListContents.map((content, idx) => (
                <div key={idx} style={{ cursor: 'pointer' }} onClick={() => handleClick(content.title)}>
                  <img
                    src={content.thumbnail}
                    alt={content.title}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                  <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>{content.title}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}




    </div>
    </div>
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
