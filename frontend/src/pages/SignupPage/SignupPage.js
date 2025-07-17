import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignupPage.css';

import Focusable from '../../components/Focusable/Focusable';
import { useFocus } from '../../context/FocusContext';

function SignupPage({ setUser }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { setSection, setIndex } = useFocus();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: ""
  });

  useEffect(() => {
    setSection("signup");
    setIndex(0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");
    try {
      const response = await axios.post('http://localhost:8000/api/signup/', {
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data);
      navigate("/select-profile");
    } catch (error) {
      console.error('회원가입 오류:', error);
      if (error.response) {
        alert(error.response.data.error || "회원가입 실패");
        console.log(error.response.data);

      } else {
        alert("서버 연결 오류");
      }
    }
  };

  return (
    <div className="register-bg">
      <div className="register-container">
        <div className="register-logo">IFITV</div>
        <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="email">이메일<span>*</span></label>
            <Focusable sectionKey="signup" index={0}>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Focusable>
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호<span>*</span></label>
            <Focusable sectionKey="signup" index={1}>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Focusable>
          </div>
          <div className="form-group">
            <label htmlFor="passwordConfirm">비밀번호 확인<span>*</span></label>
            <Focusable sectionKey="signup" index={2}>
              <input
                id="passwordConfirm"
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
              />
            </Focusable>
          </div>

          {error && <div className="form-error">{error}</div>}

          <Focusable sectionKey="signup" index={3}>
            <button className="register-btn" type="submit">회원가입</button>
          </Focusable>
        </form>

        <div className="register-bottom">
          <span>이미 계정이 있으신가요?</span>
          <Focusable sectionKey="signup" index={4}>
            <button className="login-link" onClick={() => navigate("/login")}>로그인</button>
          </Focusable>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
