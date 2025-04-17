import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfileSelectPage from './pages/ProfileSelectPage';

function App() {
  const [user, setUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  
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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
        <Route
          path="/home"
          element={
            user && selectedProfile ? (
              <HomePage
                user={user}
                profile={selectedProfile}
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
