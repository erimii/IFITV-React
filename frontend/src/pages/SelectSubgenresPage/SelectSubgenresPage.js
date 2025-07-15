import { useState, useEffect } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import axios from "axios";
import './SelectSubgenresPage.css';
import TypingText from "../../components/TypingText";

function SelectSubgenresPage({user}) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;

  const [form, setForm] = useState({ preferred_genres: {} });
  const [subgenreMapping, setSubgenreMapping] = useState({});  // { "예능": [{id, name}], ... }
  const [selectedSubgenreIds, setSelectedSubgenreIds] = useState([]);  // 최종 id 리스트

  const MAX_SELECT = 10;

  const [line1Done, setLine1Done] = useState(false);
  const [line2Done, setLine2Done] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [startTyping, setStartTyping] = useState(false);

  // ✅ 페이지 진입하자마자 타이핑 시작
  useEffect(() => {
    setStartTyping(true);
  }, []);

  // ✅ 장르 데이터는 따로 로딩
  useEffect(() => {
    axios.get('http://localhost:8000/recommendation/subgenres/')
      .then(res => {
        setSubgenreMapping(res.data);
      })
      .catch(err => {
        console.error("서브장르 불러오기 실패", err);
      });
  }, []);

  // 서브장르 토글
  const toggleSubgenre = (genre, subgenreObj) => {
    const { id: subgenreId, name: subgenreName } = subgenreObj;

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

    setSelectedSubgenreIds((prev) =>
      prev.includes(subgenreId)
        ? prev.filter((id) => id !== subgenreId)
        : [...prev, subgenreId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const profileData = {
      ...profile,
      user_id: user.id,
      preferred_genres: form.preferred_genres,
      preferred_subgenres: selectedSubgenreIds,
      liked_contents_ids: []
    };

    navigate("/select-content", { state: { profile: profileData } });
  };

  const onPrev = () => navigate("/select-subgenres");
  const onGoToLogin = () => navigate("/");

  return (
    <div className="add-profile-bg-centered">
      <div className="add-profile-container">
        <form className="add-profile-form" onSubmit={handleSubmit}>

          {/* ✅ 타이핑 인삿말 */}
          <div className="genres-title">
            {startTyping && !line1Done && (
              <TypingText
                key="line1"
                text={`안녕하세요 ${profile?.name || ""}님!`}
                className="typing-text"
                onComplete={() => setLine1Done(true)}
              />
            )}

            {line1Done && !line2Done && (
              <>
                <div className="genres-title-line">
                  안녕하세요 <span className="highlight-name">{profile?.name || ""}</span>님!
                </div>
                <TypingText
                  key="line2"
                  text="  선호 장르를 선택해주세요."
                  className="typing-text"
                  onComplete={() => {
                    setLine2Done(true);
                    setTypingDone(true);
                  }}
                />
              </>
            )}

            {line1Done && line2Done && (
              <>
                <div className="genres-title-line">
                  안녕하세요 <span className="highlight-name">{profile?.name || ""}</span>님!
                </div>
                <div className="genres-title-line">
                  선호 장르를 선택해주세요.
                </div>
              </>
            )}
          </div>

          {/* 공간 확보용*/}
          {!Object.keys(subgenreMapping).length && (
            <div style={{ height: "550px" }} />
          )}

          {/* 장르 데이터 있을 때만 리스트 렌더링 */}
          {Object.keys(subgenreMapping).length > 0 && (
            <div div className={`add-profile-genres ${typingDone ? 'visible' : ''}`}>
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
          )}

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
