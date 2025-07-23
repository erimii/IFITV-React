// src/components/Live/Live.js
import React, { useEffect } from 'react';
import HorizontalSlider from '../HorizontalSlider/HorizontalSlider';
import './Live.css';
import { useFocus } from '../../context/FocusContext';

const Live = ({ groupedLiveContents, onClick, isLoading }) => {
  const { registerSections, setSection, setIndex } = useFocus();

  useEffect(() => {
    if (!isLoading && groupedLiveContents.length > 0) {
      const sectionCount = Object.keys(groupedLiveContents).length;
      const sectionMap = {};
      for (let i = 0; i < sectionCount; i++) {
        sectionMap[`live-slider-${i}`] = groupedLiveContents[Object.keys(groupedLiveContents)[i]].length;
      }
      registerSections(sectionMap);
      setSection('live-slider-0');
      setIndex(0);
    }
  }, [groupedLiveContents, isLoading, registerSections, setSection, setIndex]);

  return (
    <div className="live-page">
      <h1 className="live-header">Live</h1>

      {isLoading ? (
        <>
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="home-skeleton-title" />
              <div className="home-skeleton-row">
                {[...Array(6)].map((_, idx) => (
                  <div className="home-skeleton-card" key={idx} />
                ))}
              </div>
            </div>
          ))}
        </>
      ) : Object.keys(groupedLiveContents).length === 0 ? (
        <p style={{ color: '#aaa', textAlign: 'center', fontSize: '1.2rem' }}>
          오늘 방송 예정 콘텐츠가 없습니다.
        </p>
      ) : (
        <div>
          {Object.entries(groupedLiveContents).map(([broadcaster, contents], sliderIndex) => (
            <HorizontalSlider
              key={broadcaster}
              title={broadcaster}
              items={contents}
              onCardClick={onClick}
              sliderIndex={sliderIndex}
              sectionKey={`live-slider-${sliderIndex}`} // 중요!!
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Live;
