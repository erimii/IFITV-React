import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileSelectPage({ user, setSelectedProfile }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [newProfile, setNewProfile] = useState({
    name: '',
    age: '',
    gender: '',
    preferred_genres: []
  });

  const genres = ["버라이어티", "쿡방/먹방", "음악예능", "애니멀", "힐링예능", "여행", "토크쇼", "서바이벌", "스포츠예능"];

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

  const toggleGenre = (g) => {
    setNewProfile(prev => ({
      ...prev,
      preferred_genres: prev.preferred_genres.includes(g)
        ? prev.preferred_genres.filter(x => x !== g)
        : [...prev.preferred_genres, g]
    }));
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

      <h3>새 프로필 추가</h3>
      <input placeholder="프로필 이름" value={newProfile.name} onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })} />
      <input type="number" placeholder="나이" value={newProfile.age} onChange={(e) => setNewProfile({ ...newProfile, age: e.target.value })} />
      <select value={newProfile.gender} onChange={(e) => setNewProfile({ ...newProfile, gender: e.target.value })}>
        <option value="">성별 선택</option>
        <option value="여">여</option>
        <option value="남">남</option>
      </select>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <strong>장르 선택:</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGenre(g)}
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: "20px",
                border: newProfile.preferred_genres.includes(g) ? "2px solid #A50034" : "1px solid #ccc",
                backgroundColor: newProfile.preferred_genres.includes(g) ? "#A50034" : "#fff",
                color: newProfile.preferred_genres.includes(g) ? "#fff" : "#333",
                cursor: "pointer"
              }}
            >
              {g}
            </button>
          ))}
        </div>
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
