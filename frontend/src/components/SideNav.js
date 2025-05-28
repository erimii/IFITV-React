import React from 'react';
import '../styles/SideNav.css';

const SideNav = ({ selectedGenre, onSelect }) => {
  const menus = ['홈','드라마', '영화', '예능', '실시간'];

  return (
    <div className="sidenav">
      {menus.map((menu) => (
        <div
          key={menu}
          className={`nav-item ${selectedGenre === menu ? 'active' : ''}`}
          onClick={() => onSelect(menu)}
        >
          {menu}
        </div>
      ))}
    </div>
  );
};

export default SideNav;