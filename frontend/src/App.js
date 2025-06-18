import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfileSelectPage from './pages/ProfileSelectPage';
import AddProfileForm from './pages/AddProfileForm';
import SelectContentPage from './pages/SelectContentPage';

function App() {
  const [user, setUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);

  // 로그인 상태 확인
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };
  // 프로필 목록 불러오기
  useEffect(() => {
    if (!user) return;
  
    axios.get("http://localhost:8000/api/profiles/by_user/", {
      params: { username: user.username },
    })
    .then((res) => setProfiles(res.data))
    .catch((err) => console.error("프로필 목록 불러오기 실패", err));
  }, [user]);
  

  return (
    <Router>
      <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            user={user}
            profiles={profiles}
            selectedProfile={selectedProfile}
            setSelectedProfile={setSelectedProfile}
          />
        }
      />

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />

        <Route
          path="/select-profile"
          element={
            user ? (
              <ProfileSelectPage
                user={user}
                setSelectedProfile={setSelectedProfile}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/add-profile" element={<AddProfileForm user={user} />} />
        <Route path="/select-content" element={<SelectContentPage user={user} />} />
        <Route
          path="/home"
          element={
            user && selectedProfile ? (
              <HomePage
                user={user}
                profile={selectedProfile}
                profiles={profiles}  
                setSelectedProfile={setSelectedProfile}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/select-profile" />
            )
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
