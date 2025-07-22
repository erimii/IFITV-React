import React, { useRef } from 'react';
import './DetailModalCarousel.css';
import Focusable from '../Focusable/Focusable';
import { useFocus } from '../../context/FocusContext';

const DetailModalCarousel = ({ recommendations, onCardClick }) => {
  const scrollRef = useRef(null);
  const { section, index, setSection, setIndex } = useFocus();

  const scrollLeft = () => {
    scrollRef.current.scrollLeft -= 300;
  };

  const scrollRight = () => {
    scrollRef.current.scrollLeft += 300;
  };

  // 키보드 네비게이션 핸들러
  const handleCardKeyDown = (e, cardIndex) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      if (cardIndex === 0) {
        setSection('modal-buttons');
        setIndex(0);
      } else {
        setIndex(cardIndex - 1);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      if (cardIndex < recommendations.length - 1) {
        setIndex(cardIndex + 1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      setSection('modal-buttons');
      setIndex(0);
    }
  };

  return (
    <div className="carousel2-outer modal-carousel-wrapper">
      <button onClick={scrollLeft} className="carousel2-arrow left">‹</button>
      <div className="carousel2-inner modal-carousel-container" ref={scrollRef}>
        {recommendations.map((item, idx) => {
          const isFocused = section === 'modal-carousel' && index === idx;
          return (
            <Focusable key={idx} sectionKey="modal-carousel" index={idx}>
              <div
                className={`carousel2-card modal-carousel-card${isFocused ? ' focused' : ''}`}
                onClick={() => onCardClick(item.title)}
                tabIndex={0}
                onKeyDown={(e) => handleCardKeyDown(e, idx)}
              >
                <div className="carousel2-image-wrapper">
                  <img
                    className="carousel2-poster"
                    src={item.thumbnail || 'https://via.placeholder.com/300x450'}
                    alt={item.title}
                  />
                  <div className="carousel2-hover-info">
                    <div className="carousel2-hover-title">{item.title}</div>
                    <div className="carousel2-hover-subgenre">{item.subgenre}</div>
                    <div className="carousel2-hover-desc">{item.description || ''}</div>
                  </div>
                </div>
              </div>
            </Focusable>
          );
        })}
      </div>
      <button onClick={scrollRight} className="carousel2-arrow right">›</button>
    </div>
  );
};

export default DetailModalCarousel;