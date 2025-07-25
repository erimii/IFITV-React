import React, { useEffect, useState } from "react";
import Focusable from '../Focusable/Focusable';
import './VODList.css';
import styles from '../HomeContentCard.module.css';
import { handleCardKeyDownWithSpace } from '../common/cardKeyHandlers';
import { useFocus } from '../../context/FocusContext';

const VODList = ({ vodContents, onClick, loaderRef, selectedSubgenre, isLoading }) => {
  const { registerSections, setSection, setIndex } = useFocus();
  const { section, index } = useFocus();

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading && vodContents.length > 0) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading, vodContents]);


  useEffect(() => {
    if (!isLoading && vodContents.length > 0) {
      registerSections({ 'vod-content': vodContents.length });
      setSection('vod-content');
      setIndex(0);
    }
  }, [vodContents, isLoading, registerSections, setSection, setIndex]);

  return (
    <div className="vod-page-container">
      <h2 className="vod-category-title">
        {selectedSubgenre?.name ? `VOD - ${selectedSubgenre.name}` : "전체 VOD 콘텐츠"}
      </h2>

      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
          }}
        >
          {Array.from({ length: 30 }).map((_, idx) => (
            <div key={idx} className="vod-skeleton-card">
              <div className="vod-skeleton-thumb" />
              <div className="vod-skeleton-title" />
            </div>
          ))}
        </div>
      ) : showContent ? (
        <div className="mylist-grid fade-in">
          {vodContents.map((content, idx) => (
            <Focusable sectionKey="vod-content" index={idx} context="vod" key={idx}>
              <div
                className={`vod-thumbnail-card ${section === 'vod-content' && index === idx ? 'focused' : ''}`}
                style={{ cursor: "pointer" }}
                onClick={() => onClick(content.title)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' && idx === 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    setSection('home-sidebar');
                    setIndex(2);
                    return;
                  }
                  handleCardKeyDownWithSpace(e, () => onClick(content.title));
                }}
              >
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
                <p className="vod-title">{content.title}</p>
              </div>
            </Focusable>
          ))}
        </div>
      ) : null}

      <div ref={loaderRef} style={{ height: "1px" }} />
    </div>
  );
};

export default VODList;
