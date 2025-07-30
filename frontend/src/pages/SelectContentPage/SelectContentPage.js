import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import CarouselSelect from '../../components/CarouselSelect/CarouselSelect';
import './SelectContentPage.css';
import TypingText from "../../components/TypingText";
import Focusable from "../../components/Focusable/Focusable";
import { useFocus } from "../../context/FocusContext";

function SelectContentPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;

  const [contentsByGenre, setContentsByGenre] = useState({});
  const [selectedContentIds, setSelectedContentIds] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [typingDone, setTypingDone] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const { setSection, setIndex, registerSections, section } = useFocus();
  const isLoading = Object.keys(contentsByGenre).length === 0;

  const sectionRefs = useRef({});

  useEffect(() => {
    if (!isLoading && Object.keys(contentsByGenre).length > 0) {
      const sectionOrder = {};
      window.scrollTo({ top: 0, behavior: 'auto' });
      Object.entries(contentsByGenre).forEach(([_, items], genreIdx) => {
        if (items && items.length > 0) {
          sectionOrder[`select-content-${genreIdx}`] = items.length;
        }
      });
      sectionOrder['select-content-btns'] = 2;
      registerSections(sectionOrder);
      setSection(Object.keys(sectionOrder)[0]);
      setIndex(0);

      // 페이드 인 트리거
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading, contentsByGenre, setSection, setIndex, registerSections]);

  useEffect(() => {
    if (section && sectionRefs.current[section]) {
      sectionRefs.current[section].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [section]);

  const fetchContents = async () => {
    try {
      const response = await axios.post("http://localhost:8000/recommendation/sample_contents/", {
        selected: profile.preferred_genres,
        profile_id: profile.id,
      });
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

  const onPrev = () => navigate("/select-profile");

  return (
    <div className="select-content-bg">
      <div className="select-content-container">
        {!typingDone ? (
          <TypingText
            text={`  ${profile?.name || ""} 님의 취향 콘텐츠를 골라주세요!`}
            className="typing-text"
            onComplete={() => setTypingDone(true)}
          />
        ) : (
          <h2 className="select-content-title">
            <span className="highlight-name">{profile?.name || ""}</span> 님의 취향 콘텐츠를 골라주세요!
          </h2>
        )}

        {isLoading ? (
          <div className="loading-wrapper">
            <div className="skeleton-title" />
            <div className="skeleton-card-row">
              {[...Array(8)].map((_, i) => (
                <div className="skeleton-card" key={i} />
              ))}
            </div>
            <div style={{ height: '20px' }}></div>
            <div className="skeleton-title" />
            <div className="skeleton-card-row">
              {[...Array(8)].map((_, i) => (
                <div className="skeleton-card" key={i} />
              ))}
            </div>
          </div>
        ) : (
          showContent && Object.entries(contentsByGenre).map(([genre, items], genreIdx) => {
            if (!items || items.length === 0) return null;

            const sectionKey = `select-content-${genreIdx}`;
            return (
              <div
                key={genre}
                className="content-category-block fade-in"
                ref={el => (sectionRefs.current[sectionKey] = el)}
              >
                <div className="content-category-label">
                  {genre}
                  {profile.preferred_genres[genre] && profile.preferred_genres[genre].length > 0 && (
                    <span> ({profile.preferred_genres[genre].join(', ')})</span>
                  )}
                </div>

                <CarouselSelect>
                  {items.map((item, itemIdx) => (
                    <Focusable
                      key={item.id}
                      sectionKey={sectionKey}
                      index={itemIdx}
                      context="select-content"
                    >
                      <button
                        onClick={() => toggleContent(item)}
                        type="button"
                        className={`content-card${selectedContentIds.includes(item.id) ? ' selected' : ''}`}
                        style={{
                          border: selectedContentIds.includes(item.id)
                            ? "2px solid #ec008c"
                            : "1px solid #ccc",
                          background: selectedContentIds.includes(item.id)
                            ? "#ec008c"
                            : "none",
                          padding: 0,
                          cursor: "pointer",
                          borderRadius: "6px"
                        }}
                      >
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          style={{ width: "100%", borderRadius: "6px" }}
                        />
                        <div className="content-card-title">{item.title}</div>
                      </button>
                    </Focusable>
                  ))}
                </CarouselSelect>
              </div>
            );
          })
        )}

        <div className="select-content-btn-row">
          <Focusable sectionKey="select-content-btns" index={0} context="select-content">
            <button className="select-content-prev-btn" onClick={onPrev} type="button">
              이전
            </button>
          </Focusable>
          <Focusable sectionKey="select-content-btns" index={1} context="select-content">
            <button className="select-content-next-btn" onClick={handleFinish} type="button">
              선택 완료
            </button>
          </Focusable>
        </div>
      </div>
    </div>
  );
}

export default SelectContentPage;
