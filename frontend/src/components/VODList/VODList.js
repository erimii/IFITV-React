import React from "react";
import './VODList.css'

const VODList = ({ vodContents, onClick, loaderRef, selectedSubgenre }) => {
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
        {vodContents.map((content, idx) => (
          <div key={idx} style={{ cursor: "pointer" }} onClick={() => onClick(content.title)}>
            <img
              src={content.thumbnail}
              alt={content.title}
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <p style={{ marginTop: "0.5rem", fontWeight: 500, color:'#fff' }}>{content.title}</p>
          </div>
        ))}
      </div>
      <div ref={loaderRef} style={{ height: "1px" }} />
    </div>
  );
};

export default VODList;
