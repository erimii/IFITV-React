import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContentDetailModal.css'
import DetailModalCarousel from '../DetailModalCarousel/DetailModalCarousel.js'

function ContentDetailModal({ content, recommendations, onClose, profile, setWatchedContentIds, watchedContentIds, likedContentIds, setLikedContentIds}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const MAX_LENGTH = 200;

  console.log(recommendations)

  useEffect(() => {
    if (!content) return;
    if (!likedContentIds || likedContentIds.length === 0) return;
  
    setLiked(likedContentIds.includes(content.id));
  }, [content, likedContentIds]);
  
  
  if (!content) return null;
  const isWatched = content && watchedContentIds.includes(content.id);

  const fullDesc = content.description || '설명 없음';
  const isLong = fullDesc.length > MAX_LENGTH;
  const displayDesc = isExpanded ? fullDesc : `${fullDesc.slice(0, MAX_LENGTH)}...`;
  
  const handleToggleLike = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/toggle_like/', {
        profile_id: profile.id,
        content_id: content.id
      });

      if (res.data.status === 'added') {
        setLiked(true);
        setLikedContentIds(prev => [...prev, content.id]);
      } else if (res.data.status === 'removed') {
        setLiked(false);
        setLikedContentIds(prev => prev.filter(id => id !== content.id));
      }
    } catch (error) {
      console.error("찜 토글 오류:", error);
    }
  };
  
  const handleWatchComplete = async () => {
    try {
      await axios.post("http://localhost:8000/recommendation/save_watch_history/", {
        profile_id: profile.id,
        content_id: content.id,
        duration: 300  // 선택값: 시청 시간 (초 단위)
      });
      alert("시청 기록이 저장되었습니다.");
      setWatchedContentIds(prev => [...prev, content.id]);
    } catch (error) {
      console.error("시청 기록 저장 실패:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-hero">
          <img className="modal-hero-bg" src={content.thumbnail} alt={content.title} />

          <div className="modal-hero-content">
            <h1 className="modal-hero-title">{content.title}</h1>
            <div className="modal-genre-section">
              <span className="modal-genre">{content.subgenre}</span>
              <span className="modal-section">{content.genre}</span>
            </div>
            <p><strong>출연</strong> {content.cast || '정보 없음'}</p>
            <p>{content.age_rating || '정보 없음'}</p>
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
            {/* {!isWatched  && (
              <button onClick={handleWatchComplete}>
                시청
              </button>
            )}
            {isWatched  && <p>시청 완료</p>} */}
            
          </div>
        </div>
        <div className="modal-actions">
          <button className="play-btn">▶ Play</button>
          <button className="mylist-btn" onClick={handleToggleLike}>
            {liked ? "추가됨": "+ My List"}
          </button>
        </div>
        <div className="related-titles">
          <h3>비슷한 {content.genre}</h3>
          <DetailModalCarousel
            results={recommendations.map((item) => (
              <div key={item.id} className="carousel2-card">
                <div className="carousel2-image-wrapper">
                <img
                  className="carousel2-poster"
                  src={item.thumbnail || 'https://via.placeholder.com/300x450'}
                  alt={item.title}
                  
                />
                <div className="carousel2-title">{item.title}</div>
                {/* 오버레이: 마우스 오버 시 노출 */}
                <div className="carousel2-hover-info">
                  <div className="carousel2-hover-title">{item.title}</div>
                  <div className="carousel2-hover-subgenre">{item.subgenre}</div>
                  <div className="carousel2-hover-desc">
                    {item.description ? item.description : ''}
                  </div>
                </div>
                </div>              
              </div>
            ))}
          />
        </div>
      </div>
    </div>
  );
}

export default ContentDetailModal;
