import { useState, useEffect } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import axios from "axios";
import './SelectSubgenresPage.css';

function SelectSubgenresPage({user}) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;

  const [form, setForm] = useState({ preferred_genres: {} });
  const [subgenreMapping, setSubgenreMapping] = useState({});  // { "예능": [{id, name}], ... }
  const [selectedSubgenreIds, setSelectedSubgenreIds] = useState([]);  // 최종 id 리스트

  const MAX_SELECT = 10;

  // 서브장르 리스트 가져오기 (id + name)
  useEffect(() => {
    axios.get('http://localhost:8000/recommendation/subgenres/')
      .then(res => {
        setSubgenreMapping(res.data);
      })
      .catch(err => {
        console.error("서브장르 불러오기 실패", err);
      });
  }, []);

  // 서브장르 토글 (name & id 둘 다 처리)
  const toggleSubgenre = (genre, subgenreObj) => {
    const { id: subgenreId, name: subgenreName } = subgenreObj;

    // preferred_genres (name 기준)
    setForm((prev) => {
      const selected = prev.preferred_genres[genre] || [];
      const updated = selected.includes(subgenreName)
        ? selected.filter((s) => s !== subgenreName)
        : [...selected, subgenreName];

        return {
          ...prev,
          preferred_genres: { ...prev.preferred_genres, [genre]: updated },
        };
      });

    // selectedSubgenreIds (id 기준)
    setSelectedSubgenreIds((prev) =>
      prev.includes(subgenreId)
        ? prev.filter((id) => id !== subgenreId)
        : [...prev, subgenreId]
    );
  };

  // 최종 제출 (id 리스트 포함해서 넘김)
  const handleSubmit = (e) => {
    e.preventDefault();

    const profileData = {
      ...profile,
      user_id: user.id,
      preferred_genres: form.preferred_genres,
      preferred_subgenres: selectedSubgenreIds,  // 서버로 넘길 id 리스트
      liked_contents_ids: []  // 다음 페이지에서 채울 거니까 비워둠
    };

    console.log("최종 profileData:", profileData);

    navigate("/select-content", { state: { profile: profileData } });
  };

  const onPrev = () => navigate("/select-profile");
  const onGoToLogin = () => navigate("/");

  return (
    <div className="add-profile-bg-centered">
      <div className="add-profile-container">
        <form className="add-profile-form" onSubmit={handleSubmit}>
          <div className="add-profile-genres">
            <div className="genres-title">안녕하세요 {profile.name}님! 선호 장르를 선택해주세요</div>
            {Object.entries(subgenreMapping).map(([genre, subgenres]) => (
              <div key={genre}>
                <div className="genre-category-label">{genre}</div>
                <div className="genre-btn-list">
                  {subgenres.map((sub) => {
                    const selected = (form.preferred_genres[genre] || []).includes(sub.name);
                    const disabled = !selected && selectedSubgenreIds.length >= MAX_SELECT;

                    return (
                      <button
                        type="button"
                        key={sub.id}
                        className={`genre-btn${selected ? " selected" : ""}`}
                        onClick={() => toggleSubgenre(genre, sub)}
                        disabled={disabled}
                      >
                        #{sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="add-profile-btn-row">
            <button
              className="add-profile-prev-btn"
              type="button"
              onClick={onPrev}
            >
              이전
            </button>
            <button
              className="add-profile-next-btn"
              type="submit"
              disabled={selectedSubgenreIds.length === 0}
            >
              다음
            </button>
          </div>
        </form>

        <div className="register-bottom">
          <span>이미 계정이 있으신가요?</span>
          <button className="login-link" type="button" onClick={onGoToLogin}>로그인</button>
        </div>
      </div>
    </div>
  );
}

export default SelectSubgenresPage;