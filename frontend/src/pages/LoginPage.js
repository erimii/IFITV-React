// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ setUser }) {
  const navigate = useNavigate();

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
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data)); // 로그인 정보 저장
      setUser(data); // App 상태 업데이트
      navigate("/select-profile"); // 홈으로 이동
    } else {
      alert(data.error || "로그인 실패");
    }
  };

  return (
    <div style={containerStyle}>
      <button onClick={() => navigate("/")} style={backButtonStyle}>← 랜딩페이지로</button>
      <h2>로그인</h2>
      <form onSubmit={handleLogin} style={formStyle}>
        <input name="username" placeholder="닉네임" value={formData.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="비밀번호" value={formData.password} onChange={handleChange} required />
        <button type="submit" style={submitButton}>로그인</button>
      </form>
    </div>
  );
}

const backButtonStyle = {
  backgroundColor: "transparent",
  border: "none",
  color: "#A50034",
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: "1rem"
};

const containerStyle = {
  maxWidth: "400px",
  margin: "4rem auto",
  padding: "2rem",
  border: "1px solid #ccc",
  borderRadius: "12px",
  textAlign: "center"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const submitButton = {
  backgroundColor: "#A50034",
  color: "white",
  padding: "0.75rem",
  fontSize: "1.1rem",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer"
};

export default LoginPage;
