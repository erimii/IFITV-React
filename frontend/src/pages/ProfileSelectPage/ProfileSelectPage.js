import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfileSelectPage.css';

function ProfileSelectPage({ user, setSelectedProfile }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", age: "", gender: "", gesture: "" });

  // 로그인한 유저의 프로필 목록 가져오기
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/profiles/by_user/', {
          params: { user_id: user.id }
        });
        setProfiles(response.data);
      } catch (error) {
        console.error('프로필 불러오기 오류:', error);
      }
    };
    fetchProfiles();
  }, [user.id]);

  const gestureOptions = [
    { value: "rock", label: "✊" },
    { value: "paper", label: "🖐" },
    { value: "scissors", label: "✌️" },
    { value: "ok", label: "👌" },
  ];
  
  // 사용된 제스처 가져오기
  const usedGestures = profiles
    .filter(p => p.name !== editingProfile)
    .map(p => p.gesture)
    .filter(Boolean);

  // 프로필 선택 → 홈으로 이동
  const handleSelect = (profile) => {
    setSelectedProfile(profile);
    navigate("/home");
  };

  // 프로필 추가
  const handleAddProfile = async () => {
    navigate("/add-profile", { state: { usedGestures, user} });
  };

  // 프로필 삭제
  const handleDelete = async (profileName) => {
    const confirmDelete = window.confirm(`${profileName} 프로필을 삭제하시겠습니까?`);
    if (!confirmDelete) return;
  
    try {
      const response = await axios.post("http://localhost:8000/api/delete_profile/", {
        user_id: user.id,
        profile_name: profileName,
      });
  
      // 성공 시 프로필 목록에서 제거
      setProfiles(prev => prev.filter(p => p.name !== profileName));
  
    } catch (error) {
      console.error('삭제 실패:', error);
      if (error.response) {
        alert(error.response.data.error || "삭제 실패");
      } else {
        alert("서버 연결 실패");
      }
    }
  };

  //프로필 수정
  const handleEdit = async (originalName) => {
    try {
      const response = await axios.patch("http://localhost:8000/api/edit_profile/", {
        user_id: user.id,
        original_name: originalName,
        updated: editForm,
      });
  
      // 수정 반영
      setProfiles(prev =>
        prev.map(p => (p.name === originalName ? { ...p, ...editForm } : p))
      );
      setEditingProfile(null);
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정에 실패했습니다.");
    }
  };

  return (
    <div className="profile-select-bg">
      <div className="profile-select-container">
        <div className="profile-select-title">프로필을 선택하세요</div>
        <div className="profile-list">
          {profiles.map((profile) => (
            <div key={profile.id} className="profile-card">
              <button
                className="profile-avatar-btn"
                onClick={() => {
                  if (editingProfile === profile.name) return;
                  handleSelect(profile);
                }}
                aria-label={`프로필 ${profile.name} 선택`}
                tabIndex={editingProfile === profile.name ? -1 : 0}
              >
                <div className="profile-avatar">
                  {profile.gesture
                    ? gestureOptions.find((opt) => opt.value === profile.gesture)?.label
                    : "✊"}
                </div>
              </button>
  
              <input
                type="text"
                className="profile-name-input"
                value={
                  editingProfile === profile.name ? editForm.name : profile.name
                }
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                maxLength={6}
                placeholder="프로필 이름"
                disabled={editingProfile !== profile.name}
              />
  
              <div className="profile-edit-actions">
                {editingProfile === profile.name ? (
                  <>
                    <div className="avatar-emoji-list">
                      {gestureOptions.map((av) => {
                        const isUsed =
                          usedGestures.includes(av.value) &&
                          av.value !== profile.gesture;
                        const isSelected = editForm.gesture === av.value;
                        return (
                          <button
                            key={av.value}
                            type="button"
                            className={`avatar-emoji-btn${
                              isSelected ? " selected" : ""
                            }`}
                            onClick={() =>
                              !isUsed &&
                              setEditForm((prev) => ({
                                ...prev,
                                gesture: av.value,
                              }))
                            }
                            disabled={isUsed}
                            title={
                              isUsed ? "다른 프로필에서 사용 중" : av.label
                            }
                          >
                            {av.label}
                          </button>
                        );
                      })}
                    </div>
  
                    <button
                      className="profile-delete-btn"
                      onClick={() => handleDelete(profile.name)}
                    >
                      🗑
                    </button>
                    <button
                      className="profile-edit-btn"
                      onClick={() => handleEdit(profile.name)}
                    >
                      ✔
                    </button>
                  </>
                ) : (
                  <button
                    className="profile-edit-btn"
                    onClick={() => {
                      setEditingProfile(profile.name);
                      setEditForm({
                        name: profile.name,
                        age: profile.age,
                        gender: profile.gender,
                        gesture: profile.gesture || "",
                      });
                    }}
                  >
                    ✏️
                  </button>
                )}
              </div>
            </div>
          ))}
  
          {profiles.length < 4 && (
            <button
              className="profile-card add-profile-btn"
              onClick={handleAddProfile}
              aria-label="프로필 추가"
            >
              <div className="profile-avatar add-avatar">+</div>
              <div className="profile-name">프로필 추가</div>
            </button>
          )}
          {profiles.length >= 4 && (
            <p style={{ color: "gray", fontSize: "0.9rem" }}>
              ※ 최대 4개의 프로필까지 생성할 수 있어요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
export default ProfileSelectPage;
