// src/components/Live/Live.js
import React from 'react';
import HorizontalSlider from '../HorizontalSlider/HorizontalSlider';
import './Live.css'

const Live = ({ groupedLiveContents, onClick, isLoading }) => {

    return (
        <div className="live-page">
          <h1 className="live-header">Live</h1>
      
          {isLoading ? (
            <>
              <div className="home-skeleton-title" />
              <div className="home-skeleton-row">
                {[...Array(6)].map((_, idx) => (
                  <div className="home-skeleton-card" key={idx} />
                ))}
              </div>
              <div className="home-skeleton-title" />
              <div className="home-skeleton-row">
                {[...Array(6)].map((_, idx) => (
                  <div className="home-skeleton-card" key={idx} />
                ))}
              </div>
              <div className="home-skeleton-title" />
              <div className="home-skeleton-row">
                {[...Array(6)].map((_, idx) => (
                  <div className="home-skeleton-card" key={idx} />
                ))}
              </div>
            </>
          ) : groupedLiveContents.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', fontSize: '1.2rem' }}>
              오늘 방송 예정 콘텐츠가 없습니다.
            </p>
          ) : (
            <div>
              {Object.entries(groupedLiveContents).map(([broadcaster, contents]) => (
                <HorizontalSlider
                  key={broadcaster}
                  title={broadcaster}
                  items={contents}
                  onCardClick={onClick}
                />
              ))}
            </div>
          )}
        </div>
      );
      
};

export default Live;
