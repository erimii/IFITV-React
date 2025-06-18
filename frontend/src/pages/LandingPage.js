import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GestureModal from '../components/GestureModal';
import axios from 'axios';

function LandingPage({ user, profiles, selectedProfile, setSelectedProfile }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProfile) {
      navigate("/home");
    }
  }, [selectedProfile]);

  return (
    <div style={containerStyle}>
      <h1 style={logoStyle}>IFITV</h1>
      <div style={buttonGroupStyle}>
        <button onClick={() => navigate("/signup")} style={buttonStyle}>회원가입</button>
        <button onClick={() => navigate("/login")} style={buttonStyle}>로그인</button>
      </div>

      {user && profiles.length > 0 && !selectedProfile && (
        <GestureModal
          profiles={profiles}
          onClose={() => {}}
          onRecognized={(profile) => setSelectedProfile(profile)}
        />
      )}
    </div>
  );
}

const containerStyle = {
  height: '100vh',
  backgroundColor: '#000',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoStyle = {
  fontSize: '10rem',
  color: '#A50034',
  marginBottom: '2rem',
  fontWeight: 'bold',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem',
};

const buttonStyle = {
  backgroundColor: '#A50034',
  border: 'none',
  color: 'white',
  padding: '0.75rem 1.5rem',
  fontSize: '1.1rem',
  borderRadius: '8px',
  cursor: 'pointer',
};

export default LandingPage;
