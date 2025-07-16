import React from "react";
import './VODList.css'

const VODList = ({ vodContents, onClick, loaderRef, selectedSubgenre, isLoading }) => {
  return (
    <div className="vod-page-container">
      <h2 className="vod-category-title">
        {selectedSubgenre?.name ? `VOD - ${selectedSubgenre.name}` : "전체 VOD 콘텐츠"}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
        }}
      >
        {isLoading
          ? Array.from({ length: 30 }).map((_, idx) => (
              <div key={idx} className="vod-skeleton-card">
                <div className="vod-skeleton-thumb" />
                <div className="vod-skeleton-title" />
              </div>
            ))
          : vodContents.map((content, idx) => (
            <div
              key={idx}
              className="vod-thumbnail-card"
              style={{ cursor: "pointer" }}
              onClick={() => onClick(content.title)}
            >
              <img
                src={content.thumbnail}
                alt={content.title}
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <p className="vod-title">{content.title}</p>

            </div>
          
            ))}
      </div>

      <div ref={loaderRef} style={{ height: "1px" }} />
    </div>
  );
};

export default VODList;
