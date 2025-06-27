// src/components/HorizontalSlider.js
import React, { useRef } from "react";
const DEFAULT_THUMBNAIL = "/default_thumb.png";  // public 폴더 기준 경로


function HorizontalSlider({ title, items, onCardClick }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollLeft -= 300;
  };

  const scrollRight = () => {
    scrollRef.current.scrollLeft += 300;
  };

  const formatAirtime = (airtime) => {
    if (!airtime) return "";
    const timePart = airtime.split(" ")[1] || airtime;  // "2025-05-15 16:30:00" 처리용
    const [hour, minute] = timePart.split(":");
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? "오후" : "오전";
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${ampm} ${displayHour}:${minute}`;
  };

  return (
    <div style={{ position: "relative", marginBottom: "2rem" }}>
      <h2 style={{ margin: "0 0 1rem 0", color:'white' }}>{title}</h2>

      {/* 슬라이드 영역 */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollBehavior: "smooth",
          gap: "1rem",
          paddingBottom: "0.5rem",
          scrollbarWidth: "none",
          msOverflowStyle: "none", 
        }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onCardClick(item.title, item.airtime)}
            style={{
              flex: "0 0 auto",
              width: "160px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <img
              src={item.thumbnail || DEFAULT_THUMBNAIL}
              alt={item.title}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            />
            <p style={{ marginTop: "0.5rem", fontWeight: "bold", color:'white' }}>{item.title}</p>
            {item.airtime && (
              <p style={{ marginTop: "0.2rem", color: "#555", fontSize: "0.85rem" }}>
                {formatAirtime(item.airtime)}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={scrollLeft}
        style={arrowStyle("left")}
      >
        ‹
      </button>
      <button
        onClick={scrollRight}
        style={arrowStyle("right")}
      >
        ›
      </button>
    </div>
  );
}

const arrowStyle = (side) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  [side]: "0",
  background: "rgba(255, 255, 255, 0.8)",
  border: "none",
  borderRadius: "50%",
  fontSize: "1.5rem",
  cursor: "pointer",
  width: "36px",
  height: "36px",
  zIndex: 1,
});

export default HorizontalSlider;
