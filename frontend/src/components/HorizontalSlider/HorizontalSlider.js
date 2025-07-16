import React, { useRef } from "react";
import "./HorizontalSlider.css";

const DEFAULT_THUMBNAIL = "/default_thumb.png";

function HorizontalSlider({ title, items, onCardClick }) {
  const scrollRef = useRef(null);

  const cleanTitle = (raw) => raw.replace(/\[\d+\]/g, "").trim();

  const scrollLeft = () => {
    scrollRef.current.scrollLeft -= 700;
  };

  const scrollRight = () => {
    scrollRef.current.scrollLeft += 700;
  };

  const formatAirtime = (airtime) => {
    if (!airtime) return "";
    const [hour, minute] = airtime.split(":");
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? "오후" : "오전";
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${ampm} ${displayHour}:${minute}`;
  };

  return (
    <div className="horizontal-slider-wrapper">
      <h2 className="horizontal-slider-title">
        {items.length > 0 && items[0].channel ? cleanTitle(title) : title}
      </h2>


      <div className="horizontal-slider-scroll" ref={scrollRef}>
        {items.map((item, idx) =>
          item.channel ? (
            <div
              key={idx}
              className="live-card"
              onClick={() => onCardClick(item.title, item.airtime)}
            >
              {item.is_live && <div className="live-badge">LIVE</div>}
              <img
                src={item.thumbnail || DEFAULT_THUMBNAIL}
                alt={item.title}
                className="live-thumbnail"
              />
              <div className="overlay-gradient" />
              <div className="card-info">
                <div className="title">{item.title}</div>
                <div className="subtitle">{cleanTitle(item.channel)}・{formatAirtime(item.airtime)}</div>
              </div>
            </div>
          ) : (
            <div
              key={idx}
              className="select-card"
              onClick={() => onCardClick(item.title)}
            >
              <img
                src={item.thumbnail || DEFAULT_THUMBNAIL}
                alt={item.title}
                className="select-card-image"
              />
              <p className="select-card-title">{item.title}</p>
            </div>
          )
        )}
      </div>

      <button onClick={scrollLeft} className="slider-arrow left">‹</button>
      <button onClick={scrollRight} className="slider-arrow right">›</button>
    </div>
  );
}

export default HorizontalSlider;
