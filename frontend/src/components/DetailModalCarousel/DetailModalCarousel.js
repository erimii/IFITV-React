import React, { useRef, useState, useEffect } from 'react';
import './DetailModalCarousel.css';

const DetailModalCarousel = ({ results }) => {
  const scrollRef = useRef(null);
  const [startIdx, setStartIdx] = useState(0);
  const [maxStartIdx, setMaxStartIdx] = useState(0);
  const [cardCount, setCardCount] = useState(React.Results.count(results));

  // 카드 개수와 한 번에 보여줄 카드 개수 계산
  useEffect(() => {
    setCardCount(React.Results.count(results));
    // 2개씩 스크롤, 한 번에 2개 보여준다고 가정
    setMaxStartIdx(Math.max(0, React.Results.count(results) - 2));
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
        {results.map((item, idx) => (
          <div key={idx} style={{ textAlign: "center" }}>
            <img
              src={item.thumbnail || "https://via.placeholder.com/300x450"}
              alt={item.title}
              style={{ width: "300px", borderRadius: "8px", marginBottom: "1rem" }}
            />
            <h3>{item.title}</h3>
            <p>{item.subgenre}</p>
            <p style={{ fontStyle: "italic" }}>📌 {item["추천 근거"]}</p>

          </div>
        ))}
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