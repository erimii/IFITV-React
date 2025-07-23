import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './CreateProfilePage.css';

import Focusable from '../../components/Focusable/Focusable';
import { useFocus } from '../../context/FocusContext';

function CreateProfilePage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const usedGestures = location.state?.usedGestures || [];

  const { setSection, setIndex, registerSections } = useFocus();

  useEffect(() => {
    registerSections({ 'create-profile': 9 }); // 0~8
    setSection("create-profile");
    setIndex(0);
  }, [registerSections, setSection, setIndex]);

  const allGestures = [
    { value: "scissors", label: "✌️" },
    { value: "rock", label: "✊" },
    { value: "paper", label: "🖐" },
    { value: "ok", label: "👌" },
  ];

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    gesture: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const profileData = {
      ...form,
      user_id: user.id,
      preferred_subgenres: [],
      liked_contents_ids: [],
    };

    console.log("최종 profileData:", profileData);
    navigate("/select-subgenres", { state: { profile: profileData } });
  };

  return (
    <div className="new-profile-bg">
      <div className="new-profile-container">
        <h2 className="new-profile-title">새 프로필 만들기</h2>

        <div className="avatar-select-row">
          {allGestures.map((g, idx) => {
            const isUsed = usedGestures.includes(g.value);
            const isSelected = form.gesture === g.value;

            // 사용 가능한 제스처만 Focusable로 감쌈
            const avatarButton = (
              <button
                type="button"
                className={`avatar-btn${isSelected ? " selected" : ""}`}
                onClick={() => {
                  if (!isUsed) setForm({ ...form, gesture: g.value });
                }}
                disabled={isUsed && !isSelected}
                aria-label={`${g.label} ${isUsed ? "(사용 중)" : ""}`}
              >
                <span className="avatar-emoji">{g.label}</span>
              </button>
            );

            return isUsed && !isSelected ? (
              <div key={g.value}>{avatarButton}</div>
            ) : (
              <Focusable key={g.value} sectionKey="create-profile" index={idx} context="create-profile">
                {avatarButton}
              </Focusable>
            );
          })}
        </div>


        <p className="gesture-select-label">
          프로필 전환 시 사용할 손 모양을 골라주세요!
        </p>

        <form className="new-profile-form" onSubmit={handleSubmit}>
          <div className="new-profile-row">
            <Focusable sectionKey="create-profile" index={4} context="create-profile">
              <input
                type="text"
                placeholder="닉네임"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={12}
                required
              />
            </Focusable>
            <Focusable sectionKey="create-profile" index={5} context="create-profile">
              <input
                type="number"
                placeholder="나이"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                min={0}
                required
              />
            </Focusable>
            <Focusable sectionKey="create-profile" index={6} context="create-profile">
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                onKeyDown={(e) => {
                  if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                    e.preventDefault(); // ←→ 방향키로 성별 바뀌는 것 방지
                  }
                }}
                required
              >
                <option value="">성별</option>
                <option value="남">남</option>
                <option value="여">여</option>
                <option value="기타">기타</option>
              </select>
            </Focusable>

          </div>

          <div className="new-profile-btn-row">
            <Focusable sectionKey="create-profile" index={7} context="create-profile">
              <button
                className="new-profile-prev-btn"
                type="button"
                onClick={() => navigate("/select-profile")}
              >
                이전
              </button>
            </Focusable>
            <Focusable sectionKey="create-profile" index={8} context="create-profile">
              <button className="new-profile-next-btn" type="submit">
                다음
              </button>
            </Focusable>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProfilePage;
