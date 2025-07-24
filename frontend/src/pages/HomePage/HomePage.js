import React, { useEffect, useState, useRef  } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ContentDetailModal from "../../components/ContentDetailModal/ContentDetailModal";
import HorizontalSlider from '../../components/HorizontalSlider/HorizontalSlider';
import MyList from '../../components/MyList/MyList';
import VODList from '../../components/VODList/VODList';
import Live from '../../components/Live/Live';
import SidebarHeader from '../../components/SidebarHeader/SidebarHeader';
import { useFocus } from '../../context/FocusContext';

import './HomePage.css'

function HomePage({ user, profile, setSelectedProfile, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [profiles, setProfiles] = useState([]);
  const [selectedMenuParam, setSelectedMenuParam] = useState("홈");

  const [modalLoading, setModalLoading] = useState(false);
  const [vodLoading, setVodLoading] = useState(false);
  const [myListLoading, setMyListLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);

  const { registerSections, setSection, setIndex, section, index } = useFocus();

  const [vodContents, setVodContents] = useState([]);
  const [myListContents, setMyListContents] = useState([]);
  const [genreContents, setGenreContents] = useState([]);
  const [livePrograms, setLivePrograms] = useState([]);
  const [likedRecommendationsByGenre, setLikedRecommendationsByGenre] = useState({ 드라마: [], 예능: [], 영화: [] });
  const [hybridRecommendations, setHybridRecommendations] = useState([]);


  const [likedContentIds, setLikedContentIds] = useState([]);
  const [watchedContentIds, setWatchedContentIds] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const loaderRef = useRef();

  const [selectedSubgenre, setSelectedSubgenre] = useState(null);
  const [groupedLiveContents, setGroupedLiveContents] = useState({});

  const [prevFocus, setPrevFocus] = useState(null);

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

  useEffect(() => {
    const fetchVOD = async () => {
      if (!profile || selectedMenuParam !== "VOD" || !hasNext) return;
      setVodLoading(true);
      try {
        const subParam = selectedSubgenre ? `&subgenre_id=${selectedSubgenre.id}` : "";
        const res = await axios.get(`http://localhost:8000/recommendation/all_vod_contents/?page=${page}${subParam}`);
        setVodContents(prev => [...prev, ...res.data.results]);
        setHasNext(res.data.has_next);
      } catch (error) {
        console.error("VOD 불러오기 실패:", error);
      } finally {
        setVodLoading(false);
      }
    };
    fetchVOD();
  }, [selectedMenuParam, page, profile, hasNext, selectedSubgenre]);

  useEffect(() => {
    if (selectedMenuParam !== "Live" || !profile) return;
    setLiveLoading(true);
    const fetchLiveContents = async () => {
      try {
        const res = await axios.get("http://localhost:8000/recommendation/api/live_by_broadcaster/");
        setGroupedLiveContents(res.data);
      } catch (error) {
        console.error("실시간 콘텐츠 불러오기 실패:", error);
      } finally {
        setLiveLoading(false);
      }
    };
    fetchLiveContents();
  }, [selectedMenuParam, profile]);

  useEffect(() => {
    const fetchMyList = async () => {
      if (!profile || selectedMenuParam !== "My List") return;
      setMyListLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/my_list/?profile_id=${profile.id}`);
        setMyListContents(res.data);
        setLikedContentIds(res.data.map(c => c.id));
      } catch (error) {
        console.error("My List 불러오기 실패:", error);
      } finally {
        setMyListLoading(false);
      }
    };
    fetchMyList();
  }, [selectedMenuParam, profile]);

  useEffect(() => {
    if (selectedMenuParam === '홈' && !loading && !isModalOpen) {
      setSection('home-slider-0');
      setIndex(0);
    }
  }, [selectedMenuParam, loading, isModalOpen, setSection, setIndex]);

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


  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (!profile) return;
      try {
        const res = await axios.get(`http://localhost:8000/recommendation/watch_history/${profile.id}`);
        setWatchedContentIds(res.data.map(id => Number(id)));
      } catch (error) {
        console.error("시청 이력 불러오기 실패:", error);
      }
    };
    fetchWatchHistory();
  }, [profile]);

  useEffect(() => {
    if (selectedMenuParam !== "홈" || !user || !profile) return;
    const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [res1, res2, res3, res4] = await Promise.all([
        axios.post("http://localhost:8000/recommendation/subgenre_based_recommend/", { profile_id: profile.id }),
        axios.post("http://localhost:8000/api/live_recommend/", { profile_id: profile.id }),
        axios.post("http://localhost:8000/recommendation/liked_based_recommend/", { profile_id: profile.id }),
        axios.post("http://localhost:8000/recommendation/logistic_hybrid_recommend/", { profile_id: profile.id })
      ]);
      setGenreContents(res1.data);
      setLivePrograms(res2.data);
      setLikedRecommendationsByGenre(res3.data);
      setHybridRecommendations(res4.data);
    } catch (err) {
      console.error("추천 오류:", err);
    } finally {
      setLoading(false);
    }
  };

    fetchRecommendations();
    
  }, [selectedMenuParam, user, profile]);

  useEffect(() => {
    if (selectedMenuParam === '홈' && !loading) {
      const sections = ['home-sidebar'];
      const genreSliders = Object.keys(likedRecommendationsByGenre).filter(genre => likedRecommendationsByGenre[genre].length > 0);
      const totalSliders = 1 + genreSliders.length + (livePrograms.length > 0 ? 1 : 0) + (hybridRecommendations.length > 0 ? 1 : 0);
      for (let i = 0; i < totalSliders; i++) {
        sections.push(`home-slider-${i}`);
      }
      registerSections(sections);
    }
  }, [selectedMenuParam, loading, likedRecommendationsByGenre, livePrograms.length, hybridRecommendations.length, registerSections]);


  const fetchDetailRecommendation = async (title, profileId) => {
    const res = await axios.post("http://localhost:8000/api/recommend_with_detail/", {
      title,
      top_n: 5,
      alpha: 0.7,
      profile_id: profileId
    });
    return res.data;
  };

  useEffect(() => {
    console.log("[DEBUG] hybridRecommendations:", hybridRecommendations);
  }, [hybridRecommendations]);


  const handleClick = async (title) => {
    setPrevFocus({ section, index }); // ⭐️ 현재 포커스 저장
    setModalLoading(true);
    try {
      const data = await fetchDetailRecommendation(title, profile.id);
      setSelectedContent(data.info);
      setResults(data.recommendations);
      setIsModalOpen(true);
    } catch (error) {
      console.error("상세 추천 오류:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
    if (prevFocus) {
      setTimeout(() => {
        setSection(prevFocus.section);
        setIndex(prevFocus.index);
      }, 0);
    }
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
    alert(programTime < now ? `🔔 "${title}" 보러가기!` : `📅 "${title}" 시청 예약하기!`);
  };

  const handleSubgenreSelect = (sub) => {
    setSelectedMenuParam("VOD");
    setSelectedSubgenre(sub);
    setVodContents([]);
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
          <h1>Welcome, {profile.name}!</h1>
          <p>Continue Watching where you left off</p>
        </div>
      )}

      {selectedMenuParam === "홈" && loading && (
        <>
          <div className="home-skeleton-title" />
          <div className="home-skeleton-row">{[...Array(6)].map((_, idx) => <div className="home-skeleton-card" key={idx} />)}</div>
          <div className="home-skeleton-title" />
          <div className="home-skeleton-row">{[...Array(6)].map((_, idx) => <div className="home-skeleton-card" key={idx} />)}</div>
        </>
      )}

      {selectedMenuParam === "My List" && <MyList myListContents={myListContents} onClick={handleClick} isLoading={myListLoading} />}
      {selectedMenuParam === "Live" && <Live groupedLiveContents={groupedLiveContents} onClick={handleClick} isLoading={liveLoading} />}
      {selectedMenuParam === "VOD" && <VODList vodContents={vodContents} onClick={handleClick} loaderRef={loaderRef} selectedSubgenre={selectedSubgenre} isLoading={vodLoading} />}

      <div className="home-content-wrapper">
        <ContentDetailModal
          content={selectedContent}
          recommendations={results}
          onClose={handleCloseModal}
          profile={profile}
          watchedContentIds={watchedContentIds}
          setWatchedContentIds={setWatchedContentIds}
          likedContentIds={likedContentIds}
          setLikedContentIds={setLikedContentIds}
          loading={modalLoading}
          setSelectedContent={setSelectedContent}
        />

        {selectedMenuParam === "홈" && !loading && (
          <>
            {/* ✅ 0번: 하이브리드 추천 */}
            {hybridRecommendations.length > 0 && (
              <HorizontalSlider
                title={`${profile.name}님을 위한 AI 하이브리드 추천`}
                items={hybridRecommendations}
                onCardClick={handleClick}
                sliderIndex={0}
              />
            )}

            {/* ✅ 1번: 실시간 추천 */}
            {livePrograms.length > 0 && (
              <HorizontalSlider
                title={`${profile.name}님의 오늘 방송 추천`}
                items={livePrograms.map((item) => ({
                  title: item["title"],
                  thumbnail: item["thumbnail"],
                  airtime: item["airtime"],
                }))}
                onCardClick={handleLiveClick}
                sliderIndex={1}
              />
            )}

            {/* ✅ 2 ~ N+1번: 찜 기반 장르별 추천 */}
            {Object.entries(likedRecommendationsByGenre).map(([genre, items], genreIndex) => (
              items.length > 0 && (
                <HorizontalSlider
                  key={genre}
                  title={`${profile.name}님을 위한 ${genre} 추천`}
                  items={items}
                  onCardClick={handleClick}
                  sliderIndex={2 + genreIndex}
                />
              )
            ))}

            {/* ✅ 마지막: 선호 장르 기반 콘텐츠 */}
            <HorizontalSlider
              title={`${profile.name}님의 선호 장르 기반 콘텐츠`}
              items={genreContents}
              onCardClick={handleClick}
              sliderIndex={2 + Object.keys(likedRecommendationsByGenre).filter(g => likedRecommendationsByGenre[g].length > 0).length}
            />
          </>
        )}

      </div>
    </div>
  );
}

export default HomePage;
