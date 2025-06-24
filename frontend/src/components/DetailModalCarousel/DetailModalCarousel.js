import React, { useRef, useState, useEffect } from 'react';
import './DetailModalCarousel.css';

const DetailModalCarousel = ({ results }) => {
  const scrollRef = useRef(null);
  const [startIdx, setStartIdx] = useState(0);
  const [maxStartIdx, setMaxStartIdx] = useState(0);
  const [cardCount, setCardCount] = useState(results?.length || 0);

  // 카드 개수와 한 번에 보여줄 카드 개수 계산
  useEffect(() => {
    const count = results?.length || 0;
    setCardCount(count);
    setMaxStartIdx(Math.max(0, count - 2));
  }, [results]);  

  // 스크롤 함수
  const scroll = (direction) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = container.querySelector('.carousel2-card');
      if (card) {
        const cardWidth = card.offsetWidth;
        const gap = parseInt(getComputedStyle(container).gap) || 0;
        const offset = (cardWidth + gap) * 2;
        container.scrollBy({ left: direction * offset, behavior: 'smooth' });
        setStartIdx(idx => {
          let next = idx + direction;
          if (next < 0) next = 0;
          if (next > maxStartIdx) next = maxStartIdx;
          return next;
        });
      }
    }
  };

  // 버튼 disabled 논리
  const isPrevDisabled = startIdx === 0;
  const isNextDisabled = startIdx >= maxStartIdx || cardCount <= 2;

  return (
    <div className="carousel2-outer">
      <button
        className="carousel2-arrow left"
        onClick={() => scroll(-1)}
        aria-label="이전"
        disabled={isPrevDisabled}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>
      <div className="carousel2-inner no-scrollbar" ref={scrollRef}>
        {results}
      </div>
      <button
        className="carousel2-arrow right"
        onClick={() => scroll(1)}
        aria-label="다음"
        disabled={isNextDisabled}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>
    </div>
  );
};

export default DetailModalCarousel;