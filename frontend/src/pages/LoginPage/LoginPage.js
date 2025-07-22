// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import Focusable from '../../components/Focusable/Focusable';
import { useFocus } from '../../context/FocusContext';

function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { setSection, setIndex, registerSections } = useFocus();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    registerSections(['login']);
    setSection('login');
    setIndex(0);
  }, [registerSections, setSection, setIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/login/', formData);
      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data);
      navigate("/select-profile");
    } catch (error) {
      console.error('로그인 오류:', error);
      if (error.response) {
        alert(error.response.data.error || "로그인 실패");
      } else {
        alert("서버 연결 오류");
      }
    }
  };

  const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google 로그인 성공:', credentialResponse);
    // 여기에 토큰 처리 로직 추가
  };

  const handleGoogleFailure = () => {
    setError('Google 로그인에 실패했습니다.');
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-logo">IFITV</div>

        <form className="login-form" onSubmit={handleLogin}>
          <Focusable sectionKey="login" index={0} context="login">
            <div>
              <input
                className="login-input"
                name="email"
                type="text"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </Focusable>

          <Focusable sectionKey="login" index={1} context="login">
            <div>
              <input
                className="login-input"
                name="password"
                type="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </Focusable>

          {error && <div className="login-error">{error}</div>}

          <Focusable sectionKey="login" index={2} context="login">
            <div>
              <button className="login-btn" type="submit">로그인</button>
            </div>
          </Focusable>
        </form>

        <div className="login-bottom">
          <span>아직 회원이 아니신가요?</span>

          <Focusable sectionKey="login" index={3} context="login">
            <div>
              <button className="register-link" onClick={() => navigate("/signup")}>
                회원가입
              </button>
            </div>
          </Focusable>
        </div>

        <div className="login-google-wrap">
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap={false}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              logo_alignment="left"
              width="100%"
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
