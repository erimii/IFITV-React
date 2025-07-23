// SelectSubgenresPage.js
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import './SelectSubgenresPage.css';
import TypingText from "../../components/TypingText";
import Focusable from "../../components/Focusable/Focusable";
import { useFocus } from "../../context/FocusContext";

function SelectSubgenresPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;

  const { setSection, setIndex, index, registerSections } = useFocus();
  const containerRef = useRef();

  const [form, setForm] = useState({ preferred_genres: {} });
  const [subgenreMapping, setSubgenreMapping] = useState({});
  const [flatSubgenres, setFlatSubgenres] = useState([]);
  const [selectedSubgenreIds, setSelectedSubgenreIds] = useState([]);
  const MAX_SELECT = 10;

  const [line1Done, setLine1Done] = useState(false);
  const [line2Done, setLine2Done] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    // subgenre 버튼 개수 + 이전/다음 버튼 2개
    const totalFocusable = flatSubgenres.length + 2;
    registerSections({ 'select-subgenres': totalFocusable });
    setSection("select-subgenres");
    setIndex(0);
    setStartTyping(true);
  }, [registerSections, setSection, setIndex, flatSubgenres.length]);

  useEffect(() => {
    axios.get('http://localhost:8000/recommendation/subgenres/')
      .then(res => {
        setSubgenreMapping(res.data);
        const flatList = [];
        Object.entries(res.data).forEach(([genre, subs]) => {
          subs.forEach(sub => {
            flatList.push({ ...sub, genre });
          });
        });
        setFlatSubgenres(flatList);
      })
      .catch(err => {
        console.error("서브장르 불러오기 실패", err);
      });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        setIndex((i) => Math.min(i + 12, flatSubgenres.length + 1)); // +1: 다음 버튼 포함
      } else if (e.key === "ArrowUp") {
        setIndex((i) => Math.max(i - 12, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flatSubgenres]);

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

  let focusIndex = 0;

  return (
    <div className="add-profile-bg-centered" ref={containerRef}>
      <div className="add-profile-container">
        <form className="add-profile-form" onSubmit={handleSubmit}>
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

          {Object.keys(subgenreMapping).length === 0 && (
            <div className="add-profile-genres">
              {[...Array(5)].map((_, idx) => (
                <div className="skeleton-genre-block" key={idx}>
                  <div className="skeleton-genre-title" />
                  <div className="skeleton-btn-row">
                    {[...Array(6)].map((_, j) => (
                      <div className="skeleton-btn" key={j} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {Object.keys(subgenreMapping).length > 0 && (
            <div className={`add-profile-genres ${typingDone ? 'visible' : ''}`}>
              {Object.entries(subgenreMapping).map(([genre, subgenres]) => (
                <div key={genre}>
                  <div className="genre-category-label">{genre}</div>
                  <div className="genre-btn-list">
                    {subgenres.map((sub) => {
                      const selected = (form.preferred_genres[genre] || []).includes(sub.name);
                      const disabled = !selected && selectedSubgenreIds.length >= MAX_SELECT;

                      return (
                        <Focusable
                          key={sub.id}
                          sectionKey="select-subgenres"
                          index={focusIndex++}
                          context="select-subgenres"
                        >
                          <button
                            type="button"
                            className={`genre-btn${selected ? " selected" : ""}`}
                            onClick={() => toggleSubgenre(genre, sub)}
                            disabled={disabled}
                          >
                            #{sub.name}
                          </button>
                        </Focusable>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="add-profile-btn-row">
            <Focusable sectionKey="select-subgenres" index={focusIndex++} context="select-subgenres">
              <button className="add-profile-prev-btn" type="button" onClick={onPrev}>
                이전
              </button>
            </Focusable>

            <Focusable sectionKey="select-subgenres" index={focusIndex++} context="select-subgenres">
              <button className="add-profile-next-btn" type="submit" disabled={selectedSubgenreIds.length === 0}>
                다음
              </button>
            </Focusable>
          </div>
        </form>

      </div>
    </div>
  );
}

export default SelectSubgenresPage;
