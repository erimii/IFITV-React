// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

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
      const response = await axios.post('http://localhost:8000/api/login/', formData);  // ✅ URL 수정 + axios
      localStorage.setItem("user", JSON.stringify(response.data)); // 로그인 정보 저장
      setUser(response.data); // App 상태 업데이트
      navigate("/select-profile"); // 홈으로 이동
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
    // 구글 로그인 성공 시 JWT 토큰(credentialResponse.credential) 처리
    console.log('Google 로그인 성공:', credentialResponse);
    // 필요시 onLogin 호출하거나 별도 소셜 로그인 처리 로직 추가
  };

  const handleGoogleFailure = () => {
    setError('Google 로그인에 실패했습니다.');
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-logo">IFITV</div>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            className="login-input"
            name="email"
            type="text"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            autoFocus
            required
          />
          <input
            className="login-input"
            name="password"
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" type="submit">로그인</button>
        </form>
        <div className="login-bottom">
          <span>아직 회원이 아니신가요?</span>
          <button className="register-link" onClick={()=>{navigate("/signup")}}>회원가입</button>
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
