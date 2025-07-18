import React, { useRef, useEffect } from 'react';
import './CarouselSelect.css';

const CarouselSelect = ({ children }) => {
  const scrollRef = useRef(null);

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // 방향키 눌렀을 때 스크롤 이동
  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      // focus가 현재 carousel 안에 있는 경우에만 스크롤 적용
      if (!scrollRef.current?.contains(active)) return;

      const scrollAmount = 900;
      if (e.key === 'ArrowRight') {
        scroll(scrollAmount);
      } else if (e.key === 'ArrowLeft') {
        scroll(-scrollAmount);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="carousel-select-outer">
      <button
        className="carousel-select-btn left"
        onClick={() => scroll(-700)}
        aria-label="이전"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>
      <div className="carousel-select-inner no-scrollbar" ref={scrollRef}>
        {children}
      </div>
      <button
        className="carousel-select-btn right"
        onClick={() => scroll(700)}
        aria-label="다음"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>
    </div>
  );
};

export default CarouselSelect;
