// src/components/HorizontalSlider.js
import React, { useRef } from "react";
import "./HorizontalSlider.css";  // 👈 CSS 분리 추천

const DEFAULT_THUMBNAIL = "/default_thumb.png";

function HorizontalSlider({ title, items, onCardClick }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollLeft -= 400;
  };

  const scrollRight = () => {
    scrollRef.current.scrollLeft += 400;
  };

  const formatAirtime = (airtime) => {
    if (!airtime) return "";
    const timePart = airtime.split(" ")[1] || airtime;
    const [hour, minute] = timePart.split(":");
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? "오후" : "오전";
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${ampm} ${displayHour}:${minute}`;
  };

  return (
    <div className="horizontal-slider-wrapper">
      <h2 className="horizontal-slider-title">{title}</h2>

      <div className="horizontal-slider-scroll" ref={scrollRef}>
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onCardClick(item.title, item.airtime)}
            className="content-card"
          >
            <img
              src={item.thumbnail || DEFAULT_THUMBNAIL}
              alt={item.title}
              className="content-card-image"
            />
            <p className="content-card-title">{item.title}</p>
            {item.airtime && (
              <p className="content-card-airtime">
                {formatAirtime(item.airtime)}
              </p>
            )}
          </div>
        ))}
      </div>

      <button onClick={scrollLeft} className="slider-arrow left">‹</button>
      <button onClick={scrollRight} className="slider-arrow right">›</button>

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
  zIndex: 5,
});

export default HorizontalSlider;
