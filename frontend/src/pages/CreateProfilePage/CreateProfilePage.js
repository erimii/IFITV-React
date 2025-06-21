import { useState, useEffect } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import './CreateProfilePage.css'

function CreateProfilePage({user}) {
  const navigate = useNavigate();
  const location = useLocation();
  const usedGestures = location.state?.usedGestures || [];

  const allGestures = [
    { value: "scissors", label: "✌️" },
    { value: "rock", label: "✊" },
    { value: "paper", label: "🖐" },
    { value: "ok", label: "👌" }
  ];

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    gesture: "",
  });

  // 최종 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    const profileData = {
      ...form,
      user_id: user.id,
      preferred_subgenres: [],
      liked_contents_ids: []
    };

    console.log("최종 profileData:", profileData);
    navigate("/select-subgenres", { state: { profile: profileData } });
  };

  return (
    <div className="new-profile-bg">
      <div className="new-profile-container">
        <h2 className="new-profile-title">새 프로필 만들기</h2>

        <div className="avatar-select-row">
          {allGestures.map((g) => {
            const isUsed = usedGestures.includes(g.value);
            const isSelected = form.gesture === g.value;
            return (
              <button
                key={g.value}
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
          })}
        </div>
        
        <p className="gesture-select-label">
          프로필 전환 시 사용할 손 모양을 골라주세요!
        </p>

        <form className="new-profile-form" onSubmit={handleSubmit}>
          <div className="new-profile-row">
            <input
              type="text"
              placeholder="닉네임"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              maxLength={12}
              required
            />
            <input
              type="number"
              placeholder="나이"
              value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })}
              min={0}
              required
            />
            <select
              value={form.gender}
              onChange={e => setForm({ ...form, gender: e.target.value })}
              required
            >
              <option value="">성별</option>
              <option value="남">남</option>
              <option value="여">여</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="new-profile-btn-row">
            <button
              className="new-profile-prev-btn"
              type="button"
              onClick={() => navigate("/select-profile")}
            >
              이전
            </button>
            <button className="new-profile-next-btn" type="submit">
              다음
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProfilePage;