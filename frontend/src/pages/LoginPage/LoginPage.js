// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: "",
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

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-logo">IFITV</div>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            className="login-input"
            name="username"
            type="text"
            placeholder="아이디"
            value={formData.username}
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
        <div>
          <p>######구글 로그인 넣기######</p>
        </div>
      </div>
    </div> 
  );
}
export default LoginPage;
