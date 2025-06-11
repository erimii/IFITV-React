import React from 'react';
import '../styles/SideNav.css';

function SideNav({ selectedMenu, onSelect }) {
  const menus = ['홈', '실시간', 'VOD', 'My List'];
  
  return (
    <div className="sidenav">
      {menus.map((menu) => (
        <div
          key={menu}
          className={`nav-item ${selectedMenu === menu ? 'active' : ''}`}
          onClick={() => onSelect(menu)}
        >
          {menu}
        </div>
      ))}
    </div>
  );
}
export default SideNav;
