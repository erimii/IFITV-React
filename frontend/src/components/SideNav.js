import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/SideNav.css';

function SideNav({ selectedMenu, onSelect }) {
  const navigate = useNavigate();
  const menus = ['홈', '실시간', 'VOD', 'My List'];
  
  const handleSelect = (menu) => {
    onSelect(menu);
    const newMenu = menu === '홈' ? '' : `?menu=${menu}`;
    navigate(`/home${newMenu}`);
  };

  return (
    <div className="sidenav">
      {menus.map((menu) => (
        <div
          key={menu}
          className={`nav-item ${selectedMenu === menu ? 'active' : ''}`}
          onClick={() => handleSelect(menu)}
        >
          {menu}
        </div>
      ))}
    </div>
  );
}
export default SideNav;
