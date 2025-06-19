import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfileSelectPage({ user, setSelectedProfile, onLogout }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);  // 현재 수정 중인 프로필
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
    { value: "rock", label: "✊ 주먹" },
    { value: "paper", label: "🖐 펼친손" },
    { value: "scissors", label: "✌️ 가위" },
    { value: "ok", label: "👌 OK" },
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
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{ margin: 0 }}>🎭 IFITV - 프로필 선택</h2>
        <button onClick={onLogout} style={LogoutButtonStyle}>🚪 로그아웃</button>
      </div>
      <div style={profileContainerStyle}>
        {profiles.map((profile, idx) => (
          <div key={idx} style={profileCardStyle}>

            <button onClick={() => handleDelete(profile.name)} style={deleteButtonStyle}>
              🗑️
            </button>
            <button
              onClick={() => {
                setEditingProfile(profile.name);
                setEditForm({ name: profile.name, age: profile.age, gender: profile.gender, gesture: profile.gesture || "", });
              }}
              style={{ ...deleteButtonStyle, right: "2.5rem", color: "#555" }}
            >
              ✏️
            </button>

            {profile.name === editingProfile ? (
              <div>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="이름"
                />
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  placeholder="나이"
                />
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                >
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
                <select
                  value={editForm.gesture}
                  onChange={(e) => setEditForm({ ...editForm, gesture: e.target.value })}
                >
                  {gestureOptions
                    .filter(option => !usedGestures.includes(option.value))  // 중복된 건 제외
                    .map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>

                <button onClick={() => handleEdit(profile.name)}>저장</button>
                <button onClick={() => setEditingProfile(null)}>취소</button>
              </div>
            ) : (
              <div onClick={() => handleSelect(profile)} style={profileTextStyle}>
                <strong>{profile.name}</strong><br />
                나이: {profile.age} / 성별: {profile.gender} / 제스처:{" "}
                {gestureOptions.find(opt => opt.value === profile.gesture)?.label || "❓"}
              </div>
            )}

          </div>
        ))}
      </div>

      {profiles.length < 4 && (
        <button onClick={handleAddProfile} style={{
          backgroundColor: "#A50034", color: "white", padding: "0.7rem 1.5rem", border: "none", borderRadius: "8px", fontSize: "1rem"
        }}>
          ➕ 프로필 추가
        </button>
      )}
      {profiles.length >= 4 && (
        <p style={{ color: "gray", fontSize: "0.9rem" }}>
          ※ 최대 4개의 프로필까지 생성할 수 있어요.
        </p>
      )}
    </div>
  );
}

const LogoutButtonStyle = {
  backgroundColor: "#eee",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const profileContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  marginBottom: "2rem"
};

const profileCardStyle = {
  padding: "1rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  width: "45%",
  position: "relative",
  backgroundColor: "#f9f9f9",
  cursor: "pointer"
};

const profileTextStyle = {
  paddingRight: "2rem"
};

const deleteButtonStyle = {
  position: "absolute",
  top: "0.5rem",
  right: "0.5rem",
  background: "none",
  border: "none",
  color: "#d00",
  fontSize: "1.2rem",
  cursor: "pointer"
};


export default ProfileSelectPage;
