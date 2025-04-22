import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileSelectPage({ user, setSelectedProfile, onLogout }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);

  // 로그인한 유저의 프로필 목록 가져오기
  useEffect(() => {
    const fetchProfiles = async () => {
      const res = await fetch(`http://localhost:5000/user_profiles/${user.username}`);
      const data = await res.json();
      setProfiles(data);
    };
    fetchProfiles();
  }, [user.username]);

  // 프로필 선택 → 홈으로 이동
  const handleSelect = (profile) => {
    setSelectedProfile(profile);
    navigate("/home");
  };

  // 프로필 추가
  const handleAddProfile = async () => {
    navigate("/add-profile");
  };

  // 프로필 삭제
  const handleDelete = async (profileName) => {
    const confirmDelete = window.confirm(`${profileName} 프로필을 삭제하시겠습니까?`);
    if (!confirmDelete) return;
  
    const response = await fetch("http://localhost:5000/delete_profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, profile_name: profileName }),
    });
  
    const data = await response.json();
    if (response.ok) {
      // 삭제 후 목록 다시 불러오기
      setProfiles(prev => prev.filter(p => p.name !== profileName));
    } else {
      alert(data.error || "삭제 실패");
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
            <div onClick={() => handleSelect(profile)} style={profileTextStyle}>
              <strong>{profile.name}</strong><br />
              나이: {profile.age} / 성별: {profile.gender}
            </div>
            <button onClick={() => handleDelete(profile.name)} style={deleteButtonStyle}>
              🗑️
            </button>
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
