// src/components/Live/Live.js
import React, { useEffect,useState } from 'react';
import HorizontalSlider from '../HorizontalSlider/HorizontalSlider';
import './Live.css';
import { useFocus } from '../../context/FocusContext';

const Live = ({ groupedLiveContents, onClick, isLoading }) => {
  const { registerSections, setSection, setIndex } = useFocus();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading && Object.keys(groupedLiveContents).length > 0) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading, groupedLiveContents]);



  useEffect(() => {
    if (!isLoading && groupedLiveContents.length > 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
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
        // ⛔ 스켈레톤
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
      ) : showContent ? (
        Object.keys(groupedLiveContents).length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center', fontSize: '1.2rem' }}>
            오늘 방송 예정 콘텐츠가 없습니다.
          </p>
        ) : (
          <div className="fade-in">
            {Object.entries(groupedLiveContents).map(([broadcaster, contents], sliderIndex) => (
              <HorizontalSlider
                key={broadcaster}
                title={broadcaster}
                items={contents}
                onCardClick={onClick}
                sliderIndex={sliderIndex}
                sectionKey={`live-slider-${sliderIndex}`}
              />
            ))}
          </div>
        )
      ) : null}

    </div>
  );
};

export default Live;
