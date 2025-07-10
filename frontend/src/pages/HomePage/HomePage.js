import React, { useEffect, useState, useRef  } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ContentDetailModal from "../../components/ContentDetailModal/ContentDetailModal";
import HorizontalSlider from '../../components/HorizontalSlider';
import MyList from '../../components/MyList/MyList';
import VODList from '../../components/VODList/VODList';
import SidebarHeader from '../../components/SidebarHeader/SidebarHeader';

import './HomePage.css'

function HomePage({ user, profile, setSelectedProfile, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [profiles, setProfiles] = useState([]);
  const [selectedMenuParam, setSelectedMenuParam] = useState("홈");
  

  const [vodContents, setVodContents] = useState([]);
  const [myListContents, setMyListContents] = useState([]);
  const [genreContents, setGenreContents] = useState([]);
  const [livePrograms, setLivePrograms] = useState([]);
  const [likedRecommendationsByGenre, setLikedRecommendationsByGenre] = useState({ 드라마: [], 예능: [], 영화: [] });

  const [likedContentIds, setLikedContentIds] = useState([]);
  const [watchedContentIds, setWatchedContentIds] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [results, setResults] = useState([]);
  const [isGestureModalOpen, setIsGestureModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const loaderRef = useRef();

  const [selectedSubgenre, setSelectedSubgenre] = useState(null);
  
  // 프로필 최신 목록 불러오기
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/profiles/by_user/', {
          params: { user_id: user.id }
        });
        setProfiles(response.data);
      } catch (error) {
        console.error('프로필 불러오기 오류:', error);
      }
    };
    fetchProfiles();
  }, [user.id]);
  
  // VOD 콘텐츠 가져오기
  useEffect(() => {
    const fetchVOD = async () => {
      if (!profile || selectedMenuParam !== "VOD" || !hasNext) return;
  
      const subParam = selectedSubgenre ? `&subgenre_id=${selectedSubgenre.id}` : "";
      const res = await axios.get(`http://localhost:8000/recommendation/all_vod_contents/?page=${page}${subParam}`);
      setVodContents(prev => [...prev, ...res.data.results]);
      setHasNext(res.data.has_next);
    };
    fetchVOD();
  }, [selectedMenuParam, page, profile, hasNext, selectedSubgenre]);
  

  // 좋아요 한 콘텐츠 가져오기
  useEffect(() => {
    const fetchMyList = async () => {
      if (!profile || selectedMenuParam !== "My List") return;
      const res = await axios.get(`http://localhost:8000/api/my_list/?profile_id=${profile.id}`);
      const contents = Array.isArray(res.data) ? res.data : [];
      setMyListContents(contents);
      setLikedContentIds(contents.map(c => c.id));
    };
    fetchMyList();
  }, [selectedMenuParam, profile]);

  // 무한 스크롤
  useEffect(() => {
    if (selectedMenuParam !== "VOD") return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNext) {
        setPage(prev => prev + 1);
      }
    });

    const target = loaderRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [selectedMenuParam, hasNext]);

  useEffect(() => {
    if (selectedMenuParam === "VOD") {
      setVodContents([]);  
      setPage(1);             
      setHasNext(true);      
    }
  }, [selectedMenuParam]);

  // 시청 기록
  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (!profile) return;
      try {
        const res = await axios.get(`http://localhost:8000/recommendation/watch_history/${profile.id}`);
        const ids = res.data.map(id => Number(id));
        setWatchedContentIds(ids);
      } catch (error) {
        console.error("시청 이력 불러오기 실패:", error);
      }
    };
  
    fetchWatchHistory();
  }, [profile]);

  // 홈 
  useEffect(() => {
    if (selectedMenuParam !== "홈" || !user || !profile) return;
  
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const [res1, res2, res3] = await Promise.all([
          // 1. 선호 장르 기반 추천
          axios.post("http://localhost:8000/recommendation/subgenre_based_recommend/", {
            profile_id: profile.id
          }),
          // 2. 실시간 방송 추천
          axios.post("http://localhost:8000/api/live_recommend/", {
            profile_id: profile.id
          }),
          // 3. liked 기반 추천 (profile_id 기반)
          axios.post("http://localhost:8000/recommendation/liked_based_recommend/", {
            profile_id: profile.id
          })
        ]);
        console.log("📺 livePrograms 응답", res2.data);
        setGenreContents(res1.data || []);
        setLivePrograms(res2.data || []);
        setLikedRecommendationsByGenre(res3.data);
      } catch (err) {
        console.error("추천 오류:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRecommendations();
  }, [selectedMenuParam, user, profile]);

  // 콘텐츠 디테일 + 비슷한 콘텐츠 추가
  const fetchDetailRecommendation = async (title, profileId) => {
    const res = await axios.post("http://localhost:8000/api/recommend_with_detail/", {
      title,
      top_n: 5,
      alpha: 0.7,
      profile_id: profileId
    });
    return res.data;
  };
  
  const handleClick = async (title) => {
    setLoading(true);
    try {
      const data = await fetchDetailRecommendation(title, profile.id);
      setSelectedContent(data.info);
      setResults(data.recommendations);
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

  const parseAirtimeToDate = (airtime) => {
    if (airtime.includes(" ")) return new Date(airtime);
  
    const [hour, minute, second] = airtime.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(second || 0);
    return date;
  };
  
  const handleLiveClick = (title, airtime) => {
    const now = new Date();
    const programTime = parseAirtimeToDate(airtime);
  
    alert(programTime < now
      ? `🔔 "${title}" 보러가기!`
      : `📅 "${title}" 시청 예약하기!`);
  };

  // vod - 서브장르 선택 시
  const handleSubgenreSelect = (sub) => {
    setSelectedMenuParam("VOD");
    setSelectedSubgenre(sub);
    setVodContents([]); // 초기화
    setPage(1);
    setHasNext(true);
  };
  
  return (
    <div className="home-page">
      <SidebarHeader
        currentProfile={profile}
        profiles={profiles}
        onLogout={onLogout}
        setSelectedProfile={setSelectedProfile}
        onEditProfile={() => navigate("/select-profile")}
        selectedMenu={selectedMenuParam}
        onSelect={setSelectedMenuParam}
        handleSubgenreSelect={handleSubgenreSelect}
      />

      {selectedMenuParam === "홈" && (
        <div className="welcome-section">
          <h1>
            Welcome, {profile.name}!
          </h1>
          <p>Continue Watching where you left off</p>
        </div>
      )}
      {selectedMenuParam === "My List" && <MyList myListContents={myListContents} onClick={handleClick} />}
      {selectedMenuParam === "VOD" && (<VODList vodContents={vodContents} onClick={handleClick} loaderRef={loaderRef} selectedSubgenre={selectedSubgenre} />
)}

      <div style={{ display: 'flex' }}>

      <div>

      <ContentDetailModal
        content={selectedContent}
        recommendations={results}
        onClose={handleCloseModal}
        profile={profile}
        watchedContentIds={watchedContentIds}
        setWatchedContentIds={setWatchedContentIds}
        likedContentIds={likedContentIds}
        setLikedContentIds={setLikedContentIds}
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

    </div>
    </div>
    </div>

  );
}

export default HomePage;
