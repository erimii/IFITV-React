import React, { useState, useEffect } from 'react';
import RecommendationCarousel from './RecommendationCarousel';

function ContentModal({ content, recommendations, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 200;

  useEffect(() => {
    if (content) {
      setIsExpanded(false);
    }
  }, [content]);
  
  if (!content) return null;  

  const fullDesc = content.description || '설명 없음';
  const isLong = fullDesc.length > MAX_LENGTH;
  const displayDesc = isExpanded ? fullDesc : `${fullDesc.slice(0, MAX_LENGTH)}...`;
  
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={closeButtonStyle}>❌</button>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <img src={content.thumbnail} alt={content.title} style={imageStyle} />

          <div>
            <h2>{content.title}</h2>
            <p><strong>출연진:</strong> {content.cast || '정보 없음'}</p>
            <p><strong>연령 등급:</strong> {content.age_rating || '정보 없음'}</p>
            <p><strong>장르:</strong> {content.genre} / {content.subgenre}</p>
            <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>
              {displayDesc}
              {isLong && (
                <span
                  style={{ color: '#A50034', cursor: 'pointer', fontWeight: 'bold', marginLeft: '0.5rem' }}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? '접기' : '더보기'}
                </span>
              )}
            </p>
          </div>
        </div>

        <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>추천 콘텐츠</h2>
        <RecommendationCarousel results={recommendations} />
      </div>
    </div>
  );
}

const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  };
  
  const modalStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
  };
  
  const imageStyle = {
    width: '180px',
    height: '270px',
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  };
  
  const closeButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  };  

export default ContentModal;
