import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import { FocusProvider } from './context/FocusContext';

import SplashScreen from './components/SplashScreen/SplashScreen';

import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage/SignupPage';
import LoginPage from './pages/LoginPage/LoginPage';

import HomePage from './pages/HomePage/HomePage';

import ProfileSelectPage from './pages/ProfileSelectPage/ProfileSelectPage';
import CreateProfilePage from './pages/CreateProfilePage/CreateProfilePage';
import SelectSubgenresPage from './pages/SelectSubgenresPage/SelectSubgenresPage';
import SelectContentPage from './pages/SelectContentPage/SelectContentPage';


function App() {
  const [user, setUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);

  const [showSplash, setShowSplash] = useState(true);

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
      params: { user_id: user.id },
    })
    .then((res) => setProfiles(res.data))
    .catch((err) => console.error("프로필 목록 불러오기 실패", err));
  }, [user]);
  

  return (
    <FocusProvider>
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <Router>
          <Routes>
          <Route
            path="/"
            element={
              user ? (
                <LandingPage
                  user={user}
                  profiles={profiles}
                  selectedProfile={selectedProfile}
                  setSelectedProfile={setSelectedProfile}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

            <Route path="/signup" element={<SignupPage  setUser={setUser} />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />

            <Route
              path="/select-profile"
              element={
                user ? (
                  <ProfileSelectPage
                    user={user}
                    setSelectedProfile={setSelectedProfile}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/create-profile" element={<CreateProfilePage  user={user} />} />
            <Route path="/select-subgenres" element={<SelectSubgenresPage user={user} />} />
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
      )}
    </>
    </FocusProvider>
  );
}

export default App;
