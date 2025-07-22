import React, { useRef } from "react";
import "./HorizontalSlider.css";
import Focusable from '../Focusable/Focusable';
import { useFocus } from '../../context/FocusContext';
import { handleCardKeyDownWithSpace } from '../common/cardKeyHandlers';
import styles from '../HomeContentCard.module.css';

const DEFAULT_THUMBNAIL = "/default_thumb.png";

function HorizontalSlider({ title, items, onCardClick, sliderIndex = 0 }) {
  const scrollRef = useRef(null);
  const { section, index, setSection, setIndex } = useFocus();

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

  // 키보드 네비게이션 핸들러
  const handleCardKeyDown = (e, cardIndex) => {
    const sectionKey = `home-slider-${sliderIndex}`;
    
    console.log("[CARD KEYDOWN]", e.key, "cardIndex:", cardIndex, "sliderIndex:", sliderIndex);
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      if (cardIndex === 0) {
        // 첫 번째 카드에서 왼쪽 키를 누르면 사이드바로 이동
        console.log("[LEFT ARROW] Moving to sidebar, Home");
        setSection('home-sidebar');
        setIndex(0);
      } else {
        // 같은 슬라이더 내에서 이전 카드로
        console.log("[LEFT ARROW] Moving to previous card");
        setIndex(cardIndex - 1);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      if (cardIndex < items.length - 1) {
        // 같은 슬라이더 내에서 다음 카드로
        setIndex(cardIndex + 1);
      } else {
        // 마지막 카드에서 오른쪽 키를 누르면 다음 슬라이더로
        setSection(`home-slider-${sliderIndex + 1}`);
        setIndex(0);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      if (sliderIndex > 0) {
        // 이전 슬라이더의 같은 위치로
        setSection(`home-slider-${sliderIndex - 1}`);
        setIndex(Math.min(cardIndex, items.length - 1));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      // 다음 슬라이더의 같은 위치로
      setSection(`home-slider-${sliderIndex + 1}`);
      setIndex(Math.min(cardIndex, items.length - 1));
    }
  };

  return (
    <div className="horizontal-slider-wrapper">
      <h2 className="horizontal-slider-title">
        {items.length > 0 && items[0].channel ? cleanTitle(title) : title}
      </h2>

      <div className="horizontal-slider-scroll" ref={scrollRef}>
        {items.map((item, idx) => {
          const sectionKey = `home-slider-${sliderIndex}`;
          const isFocused = section === sectionKey && index === idx;
          
          return item.channel ? (
            <Focusable key={idx} sectionKey={sectionKey} index={idx}>
              <div
                className={
                  `${styles.homeContentCard} ${isFocused ? styles.homeContentCardFocused : ''} live-card`
                }
                onClick={() => onCardClick(item.title, item.airtime)}
                tabIndex={0}
                onKeyDown={(e) => {
                  handleCardKeyDownWithSpace(e, () => onCardClick(item.title, item.airtime));
                  handleCardKeyDown(e, idx);
                }}
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
            </Focusable>
          ) : (
            <Focusable key={idx} sectionKey={sectionKey} index={idx}>
              <div
                className={
                  `${styles.homeContentCard} ${isFocused ? styles.homeContentCardFocused : ''} select-card`
                }
                onClick={() => onCardClick(item.title)}
                tabIndex={0}
                onKeyDown={(e) => {
                  handleCardKeyDownWithSpace(e, () => onCardClick(item.title));
                  handleCardKeyDown(e, idx);
                }}
              >
                <img
                  src={item.thumbnail || DEFAULT_THUMBNAIL}
                  alt={item.title}
                  className="select-card-image"
                />
                <p className="select-card-title">{item.title}</p>
              </div>
            </Focusable>
          );
        })}
      </div>

      <button onClick={scrollLeft} className="slider-arrow left">‹</button>
      <button onClick={scrollRight} className="slider-arrow right">›</button>
    </div>
  );
}

export default HorizontalSlider;
