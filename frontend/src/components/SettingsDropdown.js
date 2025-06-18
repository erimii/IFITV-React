import React, { useState, useRef, useEffect } from 'react';

function SettingsDropdown({ onLogout, onEditProfile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button onClick={() => setOpen(prev => !prev)} style={buttonStyle}>
        ⚙️
      </button>
      {open && (
        <div style={dropdownStyle}>
          <button style={itemStyle} onClick={onEditProfile}>프로필 수정</button>
          <button style={itemStyle} onClick={onLogout}>로그아웃</button>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  fontSize: "1.2rem",
  background: "transparent",
  border: "none",
  cursor: "pointer"
};

const dropdownStyle = {
    position: "absolute",
    top: "2.2rem",
    right: 0,
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "0.25rem 0",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    zIndex: 1000,
    minWidth: "120px", 
    textAlign: "left",
  };

  const itemStyle = {
    background: "none",
    border: "none",
    padding: "0.5rem 1rem",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    whiteSpace: "nowrap",     
    fontSize: "0.95rem",     
  };
  
  
export default SettingsDropdown;
