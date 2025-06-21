import React, { useRef } from 'react';
import './CarouselSelect.css';

const CarouselSelect = ({ children }) => {
  const scrollRef = useRef(null);

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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