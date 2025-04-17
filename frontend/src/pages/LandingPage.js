// src/pages/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h1 style={{
        fontSize: '10rem',
        color: '#A50034',
        marginBottom: '2rem',
        fontWeight: 'bold',
      }}>
        IFITV
      </h1>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => navigate("/signup")}
          style={buttonStyle}
        >
          회원가입
        </button>
        <button
          onClick={() => navigate("/login")}
          style={buttonStyle}
        >
          로그인
        </button>
      </div>
    </div>
  );
}

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
