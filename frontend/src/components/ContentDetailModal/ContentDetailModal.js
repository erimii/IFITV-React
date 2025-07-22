// ContentDetailModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContentDetailModal.css';
import DetailModalCarousel from '../DetailModalCarousel/DetailModalCarousel';
import Focusable from '../Focusable/Focusable';
import { useFocus } from '../../context/FocusContext';

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
  const { section, index, setSection, setIndex } = useFocus();

  useEffect(() => {
    if (content) {
      setIsLiked(likedContentIds.includes(content.id));
      setIsWatched(watchedContentIds.includes(content.id));
    }
  }, [content, likedContentIds, watchedContentIds]);

  useEffect(() => {
    if (!content) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [content, onClose]);

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

  // 키보드 네비게이션 핸들러
  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!content) return null;

  // 줄거리 더보기/닫기
  const desc = content.description || '설명이 없습니다.';
  const isLong = desc.length > 120;
  const displayDesc = isExpanded ? desc : desc.slice(0, 120) + (isLong ? '...' : '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} tabIndex={0} onKeyDown={handleModalKeyDown}>
        {loading ? (
          <div className="modal-loading">
            <div className="loading-spinner"></div>
            <p>콘텐츠 정보를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 상단 대형 썸네일/배경 */}
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
                <p className="modal-cast"><strong>출연</strong> {content.cast || '정보 없음'}</p>
                <p className="modal-hero-overview">
                  {displayDesc}
                  {isLong && (
                    <span
                      style={{ color: '#ec008c', cursor: 'pointer', fontWeight: 'bold', marginLeft: '0.5rem' }}
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? '닫기' : '더보기'}
                    </span>
                  )}
                </p>
                <div className="modal-actions">
                  <button className="play-btn" onClick={handleWatch}>{isWatched ? '✅ 시청 완료' : '▶ Play'}</button>
                  <button className="mylist-btn" onClick={handleLike}>
                    {isLiked ? '추가됨' : '+ My List'}
                  </button>
                </div>
              </div>
              <button className="modal-close" onClick={onClose} aria-label="닫기">✕</button>
            </div>

            {/* 추천 콘텐츠 */}
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
