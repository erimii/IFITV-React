import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import CarouselSelect from '../../components/CarouselSelect/CarouselSelect';
import './SelectContentPage.css';

function SelectContentPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;
  console.log("최종 profile:", profile);
  const [contentsByGenre, setContentsByGenre] = useState({});
  const [selectedContentIds, setSelectedContentIds] = useState([]);  // id로 관리
  const [selectedTitles, setSelectedTitles] = useState([]);  // UI 표시용

  const fetchContents = async () => {
    try {
      const response = await axios.post("http://localhost:8000/recommendation/sample_contents/", {
        selected: profile.preferred_genres,
        profile_id: profile.id,
      });
      console.log("콘텐츠 불러오기 성공:", response.data);
      setContentsByGenre(response.data);
    } catch (error) {
      console.error('콘텐츠 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [profile]);

  const toggleContent = (content) => {
    const { id, title } = content;

    setSelectedContentIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );

    setSelectedTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleFinish = async () => {
    const fullProfile = {
      ...profile,
      liked_contents: selectedTitles,
      liked_contents_ids: selectedContentIds
    };

    console.log("최종 전송 데이터:", {
      user_id: user.id,
      profile: fullProfile
    });

    try {
      await axios.post("http://localhost:8000/api/add_profile/", {
        user_id: user.id,
        profile: fullProfile
      });
      navigate("/select-profile");
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      alert("프로필 저장 실패");
    }
  };
  const onPrev = () => navigate("/select-profile");

  return (
    <div className="select-content-bg">
      <div className="select-content-container">
      <h2 className="select-content-title">
        <span className="highlight-name">{profile.name}</span> 님의 취향 콘텐츠를 골라주세요!
      </h2>

      {Object.entries(contentsByGenre).map(([genre, items]) => (
        <div key={genre} className="content-category-block">
          <div className="content-category-label">
            {genre} 
            {profile.preferred_genres[genre] && profile.preferred_genres[genre].length > 0 && (
              <span>({profile.preferred_genres[genre].join(', ')})</span>
            )}
          </div>

          <CarouselSelect>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleContent(item)}
                  className={`content-card${selectedContentIds.includes(item.id) ? ' selected' : ''}`}
                  style={{
                    border: selectedContentIds.includes(item.id) ? "2px solid #A50034" : "1px solid #ccc",
                  }}
                >
                  <img src={item.thumbnail} alt={item.title} style={{ width: "100%", borderRadius: "6px" }} />
                  <div className="content-card-title">{item.title}</div>
                </div>
              ))}
          </CarouselSelect>
        </div>
      ))}

        <div className="select-content-btn-row">
          <button
            className="select-content-prev-btn"
            onClick={onPrev}
            type="button"
          >
            이전
          </button>
          <button
            className="select-content-next-btn"
            onClick={handleFinish}
            type="button"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectContentPage;
