import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfileSelectPage.css';

function ProfileSelectPage({ user, setSelectedProfile }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", age: "", gender: "", gesture: "" });

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/profiles/by_user/', {
          params: { user_id: user.id }
        });
        setProfiles(response.data);
      } catch (error) {
        console.error('프로필 불러오기 오류:', error);
      } finally {
        setLoading(false);
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

  const usedGestures = profiles
    .filter(p => p.name !== editingProfile)
    .map(p => p.gesture)
    .filter(Boolean);

  const handleSelect = (profile) => {
    setSelectedProfile(profile);
    navigate("/home");
  };

  const handleAddProfile = async () => {
    navigate("/create-profile", { state: { usedGestures, user } });
  };

  const handleDelete = async (profileName) => {
    const confirmDelete = window.confirm(`${profileName} 프로필을 삭제하시겠습니까?`);
    if (!confirmDelete) return;

    try {
      await axios.post("http://localhost:8000/api/delete_profile/", {
        user_id: user.id,
        profile_name: profileName,
      });
      setProfiles(prev => prev.filter(p => p.name !== profileName));
    } catch (error) {
      console.error('삭제 실패:', error);
      alert(error.response?.data?.error || "삭제 실패");
    }
  };

  const handleEdit = async (originalName) => {
    try {
      await axios.patch("http://localhost:8000/api/edit_profile/", {
        user_id: user.id,
        original_name: originalName,
        updated: editForm,
      });
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
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="profile-card skeleton-profile-card" />
            ))
          ) : (
            <>
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
                                className={`avatar-emoji-btn${isSelected ? " selected" : ""}`}
                                onClick={() =>
                                  !isUsed &&
                                  setEditForm((prev) => ({
                                    ...prev,
                                    gesture: av.value,
                                  }))
                                }
                                disabled={isUsed}
                                title={isUsed ? "다른 프로필에서 사용 중" : av.label}
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
                        🖊
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
            </>
          )}
        </div>
        {!loading && profiles.length >= 4 && (
          <p style={{ color: "gray", fontSize: "0.9rem" }}>
            ※ 최대 4개의 프로필까지 생성할 수 있어요.
          </p>
        )}
      </div>
    </div>
  );
}

export default ProfileSelectPage;
