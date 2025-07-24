import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './ContentDetailModal.css';
import DetailModalCarousel from '../DetailModalCarousel/DetailModalCarousel';
import { useFocus } from '../../context/FocusContext';
import Focusable from '../Focusable/Focusable';

const ContentDetailModal = ({
  content,
  recommendations,
  onClose,
  profile,
  watchedContentIds,
  setWatchedContentIds,
  likedContentIds,
  setLikedContentIds,
  loading,
  setSelectedContent
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { section, index, setSection, setIndex, registerSections } = useFocus();
  const playButtonRef = useRef();

  // ✅ 이전 포커스 상태 저장용 ref
  const prevSectionRef = useRef(null);
  const prevIndexRef = useRef(null);

  useEffect(() => {
    if (content) {
      setIsLiked(likedContentIds.includes(content.id));
      setIsWatched(watchedContentIds.includes(content.id));
    }
  }, [content, likedContentIds, watchedContentIds]);

  // ✅ 모달 열릴 때: 포커스 저장 + Play 버튼 포커스
  useEffect(() => {
    if (content) {
      prevSectionRef.current = section;
      prevIndexRef.current = index;
      setSection('modal-actions');
      setIndex(0);
  
      // ⭐️ 여기가 핵심!
      registerSections({ 'modal-actions': 2 });
    }
  }, [content]);
  

  // ✅ 모달 닫기 + 포커스 복구 함수
  const handleClose = () => {
    if (prevSectionRef.current !== null && prevIndexRef.current !== null) {
      setSection(prevSectionRef.current);
      setIndex(prevIndexRef.current);
    }
    onClose();
  };

  // ✅ ESC 키로 닫기
  useEffect(() => {
    if (!content) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [content]);

  const handleLike = async () => {
    if (!profile || !content) return;
    try {
      if (isLiked) {
        await axios.delete(`http://localhost:8000/api/my_list/${content.id}/${profile.id}/`);
        setLikedContentIds(prev => prev.filter(id => id !== content.id));
      } else {
        await axios.post('http://localhost:8000/api/my_list/', {
          content_id: content.id,
          profile_id: profile.id
        });
        setLikedContentIds(prev => [...prev, content.id]);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
    }
  };

  const handleWatch = async () => {
    if (!profile || !content) return;
    try {
      await axios.post('http://localhost:8000/recommendation/watch_history/', {
        content_id: content.id,
        profile_id: profile.id
      });
      setWatchedContentIds(prev => [...prev, content.id]);
      setIsWatched(true);
    } catch (error) {
      console.error('시청 기록 처리 오류:', error);
    }
  };

  const desc = content?.description || '설명이 없습니다.';
  const isLong = desc.length > 120;
  const displayDesc = isExpanded ? desc : desc.slice(0, 120) + (isLong ? '...' : '');

  useEffect(() => {
    const handleArrowKey = (e) => {
      if (!content) return;
  
      if (section === 'modal-actions' && e.key === 'ArrowRight') {
        if (index === 1 && recommendations && recommendations.length > 0) {
          e.preventDefault();
          setSection('modal-carousel');
          setIndex(0);
        }
      }
  
      if (section === 'modal-carousel' && e.key === 'ArrowLeft' && index === 0) {
        e.preventDefault();
        setSection('modal-actions');
        setIndex(1);
      }
    };
  
    window.addEventListener('keydown', handleArrowKey);
    return () => window.removeEventListener('keydown', handleArrowKey);
  }, [section, index, content, recommendations, setSection, setIndex]);
  

  if (!content) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleClose();
        }}
      >
        {loading ? (
          <div className="modal-loading">
            <div className="loading-spinner"></div>
            <p>콘텐츠 정보를 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="modal-hero">
              <img
                className="modal-hero-bg"
                src={content.thumbnail || '/default_thumb.png'}
                alt={content.title}
              />
              <div className="modal-hero-content">
                <h1 className="modal-hero-title">{content.title}</h1>
                <div className="modal-genre-section">
                  <span className="modal-section">{content.genre} -</span>
                  <span className="modal-genre">{content.subgenre}</span>
                  <span className="modal-age">{content.age_rating || '정보 없음'}</span>
                </div>
                <p className="modal-cast">
                  <strong>출연</strong> {content.cast || '정보 없음'}
                </p>
                <p className="modal-hero-overview">
                  {displayDesc}
                  {isLong && (
                    <span
                      style={{
                        color: '#ec008c',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                      }}
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? '닫기' : '더보기'}
                    </span>
                  )}
                </p>
                <div className="modal-actions">
                <Focusable sectionKey="modal-actions" index={0} context="modal">
                  <button
                    className="play-btn"
                    onClick={handleWatch}
                  >
                    {isWatched ? '▶ Play' : '▶ Play'}
                  </button>
                </Focusable>

                <Focusable sectionKey="modal-actions" index={1} context="modal">
                  <button
                    className="mylist-btn"
                    onClick={handleLike}
                  >
                    {isLiked ? '추가됨' : '+ My List'}
                  </button>
                </Focusable>
              </div>
              </div>
              <button className="modal-close" onClick={handleClose} aria-label="닫기">
                ✕
              </button>
            </div>

            {recommendations && recommendations.length > 0 && (
              <DetailModalCarousel
                recommendations={recommendations}
                onCardClick={setSelectedContent}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContentDetailModal;
