// src/pages/SignupPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    age: "",
    gender: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (response.ok) {
      alert("회원가입 성공! 로그인해주세요.");
      navigate("/login");
    } else {
      alert(data.error || "회원가입 실패");
    }
  };

  return (
    <div style={containerStyle}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input name="username" placeholder="닉네임" value={formData.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="비밀번호" value={formData.password} onChange={handleChange} required />
        <input name="age" type="number" placeholder="나이" value={formData.age} onChange={handleChange} required />
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">성별 선택</option>
          <option value="여">여</option>
          <option value="남">남</option>
        </select>

        <button type="submit" style={submitButton}>회원가입</button>
      </form>
    </div>
  );
}

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

export default SignupPage;
