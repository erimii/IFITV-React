import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileSelectPage({ user, setSelectedProfile }) {
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

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>프로필 선택</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        {profiles.map((profile, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(profile)}
            style={{
              padding: "1rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              cursor: "pointer",
              width: "45%"
            }}
          >
            <strong>{profile.name}</strong><br />
            나이: {profile.age} / 성별: {profile.gender}
          </button>
        ))}
      </div>

      <button onClick={handleAddProfile} style={{
        backgroundColor: "#A50034", color: "white", padding: "0.7rem 1.5rem", border: "none", borderRadius: "8px", fontSize: "1rem"
      }}>
        ➕ 프로필 추가
      </button>
    </div>
  );
}

export default ProfileSelectPage;
