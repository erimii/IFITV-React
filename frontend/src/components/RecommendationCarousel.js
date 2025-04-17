// src/components/RecommendationCarousel.js

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function RecommendationCarousel({ results, onSimilarClick }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <Slider {...settings}>
      {results.map((item, idx) => (
        <div key={idx} style={{ textAlign: "center" }}>
          <img
            src={item.thumbnail || "https://via.placeholder.com/300x450"}
            alt={item.title}
            style={{ width: "300px", borderRadius: "8px", marginBottom: "1rem" }}
          />
          <h3>{item.title}</h3>
          <p>{item.subgenre}</p>
          <p style={{ fontStyle: "italic" }}>📌 {item["추천 근거"]}</p>

          <button
            onClick={() => onSimilarClick(item.title)}
            style={{
              marginTop: "1rem",
              backgroundColor: "#f06292",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
            }}
          >
            🎯 이거와 비슷한 콘텐츠 더 보기
          </button>
        </div>
      ))}
    </Slider>
  );
}

export default RecommendationCarousel;
