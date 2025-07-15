import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GestureModal from '../GestureModal/GestureModal';
import axios from 'axios';
import './SidebarHeader.css';

const SidebarHeader = ({
  onLogout,
  currentProfile,
  profiles,
  setSelectedProfile,
  onEditProfile,
  selectedMenu,
  onSelect,
  handleSubgenreSelect,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [liveDropdownOpen, setLiveDropdownOpen] = useState(false);
  const [vodDropdownOpen, setVodDropdownOpen] = useState(false);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  const [isGestureModalOpen, setIsGestureModalOpen] = useState(false);

 /* 후버 후버 구조를 위해,, */
  const [subgenresByGenre, setSubgenresByGenre] = useState([]);
  const [hoveredGenre, setHoveredGenre] = useState(null);

  useEffect(() => {
    const fetchGenresWithSubgenres = async () => {
      try {
        const res = await axios.get("http://localhost:8000/recommendation/genres_with_subgenres/");
        setSubgenresByGenre(res.data); // 변수 이름은 그대로 써도 되고, 바꾸고 싶으면 같이 수정
        console.log("장르 + 서브장르 응답 확인", res.data);
      } catch (error) {
        console.error("장르 + 서브장르 가져오기 오류:", error);
      }
    };
  
    fetchGenresWithSubgenres();
  }, []);
  

  const settingsRef = useRef();

  useEffect(() => {
    if (!settingsDropdownOpen) return;
    const handleClick = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [settingsDropdownOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <aside className="sidebar-header">
      <div className="sidebar-logo">
        IFITV
      </div>

      <nav className="sidebar-nav"> 
        <div
            className={`sidebar-flyout-toggle ${selectedMenu === '홈' ? 'active' : ''}`}
            onClick={() => onSelect('홈')}
        >
            Home
        </div>

        {/* Live 메뉴 */}
        <div
          className="sidebar-flyout"
        >
          <div
            className={`sidebar-flyout-toggle ${selectedMenu === 'LIVE' ? 'active' : ''}`}
            onClick={() => onSelect('LIVE')}
          >
            Live
          </div>
        </div>

        {/* VOD */}
        <div
          className="sidebar-flyout"
          onMouseEnter={() => setVodDropdownOpen(true)}
          onMouseLeave={() => {
            setVodDropdownOpen(false);
            setHoveredGenre(null); // 마우스 나가면 서브장르도 닫음
          }}
        >
          <div
            className={`sidebar-flyout-toggle ${
              selectedMenu === 'VOD' ? 'active' : vodDropdownOpen || hoveredGenre ? 'submenu-active' : ''
            }`}
            onClick={() => onSelect('VOD')}
          >
            VOD
          </div>



          {vodDropdownOpen && (
            <div
              className="vod-flyout-wrapper"
              onMouseLeave={() => {
                setVodDropdownOpen(false);
                setHoveredGenre(null);
              }}
            >
              <div className="sidebar-flyout-menu">
                {subgenresByGenre.map((genreObj) => (
                  <div
                    key={genreObj.id}
                    className="sidebar-flyout-group"
                    onMouseEnter={() => setHoveredGenre(genreObj.id)}
                  >
                    <button
                      className={`sidebar-flyout-item ${
                        hoveredGenre === genreObj.id ? 'active' : ''
                      }`}
                    >
                      {genreObj.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* 서브장르 영역도 wrapper 안에 같이 넣음 */}
              {hoveredGenre && (
                <div className="sidebar-subgenre-menu">
                  {subgenresByGenre
                    .find((g) => g.id === hoveredGenre)
                    ?.subgenres.map((sub) => (
                      <button
                        key={sub.id}
                        className="sidebar-flyout-item"
                        style={{ fontSize: '0.95rem' }}
                        onClick={() => handleSubgenreSelect(sub)}
                      >
                        {sub.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>

        <div
            className={`sidebar-flyout-toggle ${selectedMenu === 'My List' ? 'active' : ''}`}
            onClick={() => onSelect('My List')}
        >
            My List
        </div>

      </nav>


      <div className="sidebar-search">
      <span
        className="search-icon"
        onClick={() => setSearchOpen(v => !v)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        aria-label="검색 열기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="17" y1="17" x2="21" y2="21" />
        </svg>
      </span>


        {searchOpen && (
          <form className="search-form" onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="영화, TV 검색"
              autoFocus
            />
            <button
              type="button"
              className="search-close-btn"
              onClick={() => setSearchOpen(false)}
              aria-label="검색창 닫기"
            >x</button>
          </form>
        )}
      </div>

      <div className="sidebar-profile">
        <div className="sidebar-gesture">
          <button
          onClick={() => setIsGestureModalOpen(true)}
          className="gesture-button"
          aria-label="프로필 제스처 전환"
          >
          <span>
          {currentProfile?.gesture === "scissors" && "✌️"}
          {currentProfile?.gesture === "rock" && "✊"}
          {currentProfile?.gesture === "paper" && "🖐"}
          {currentProfile?.gesture === "ok" && "👌"}
          </span>

          </button>
          <div className="profile-name">{currentProfile.name}</div>
          {isGestureModalOpen && (
              <GestureModal
                profiles={profiles}
                currentProfile={currentProfile}
                onClose={() => setIsGestureModalOpen(false)}
                onRecognized={(matchedProfile) => {
                  setSelectedProfile?.(matchedProfile);
                  setIsGestureModalOpen(false);
                  navigate("/home");
              }}
              />
            )}
        </div>



        {/* 설정(톱니바퀴) 드롭다운 */}
        <div
          className="sidebar-dropdown"
          ref={settingsRef}
          style={{ width: '100%', textAlign: 'center', marginTop: 2 }}
          onMouseEnter={() => setSettingsDropdownOpen(true)}
          onMouseLeave={() => setSettingsDropdownOpen(false)}
        >
          <button
            className="sidebar-dropdown-item settings-gear-btn"
            aria-label="설정"
            tabIndex={0}
          >
            {/* Google Settings SVG 아이콘 */}
            <svg className="settings-gear-icon" viewBox="0 0 24 24">
              <path d="M19.14,12.94a7,7,0,0,0,0-1.88l2.11-1.65a.5.5,0,0,0,.12-.64l-2-3.46a.5.5,0,0,0-.61-.23l-2.49,1a7,7,0,0,0-1.6-.93l-.38-2.65A.5.5,0,0,0,13.5,2h-4a.5.5,0,0,0-.5.42l-.38,2.65a7,7,0,0,0-1.6.93l-2.49-1a.5.5,0,0,0-.61.23l-2,3.46a.5.5,0,0,0,.12.64l2.11,1.65a7,7,0,0,0,0,1.88l-2.11,1.65a.5.5,0,0,0-.12.64l2,3.46a.5.5,0,0,0,.61.23l2.49-1a7,7,0,0,0,1.6.93l.38,2.65A.5.5,0,0,0,9.5,22h4a.5.5,0,0,0,.5-.42l.38-2.65a7,7,0,0,0,1.6-.93l2.49,1a.5.5,0,0,0,.61-.23l2-3.46a.5.5,0,0,0-.12-.64ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
            </svg>
          </button>
          {settingsDropdownOpen && (
            <div className="sidebar-dropdown-menu">
              <button
                className="sidebar-dropdown-item"
                onClick={onEditProfile}
                type="button"
              >
                프로필 수정
              </button>
              <div className="dropdown-divider" />
              <button
                className="sidebar-dropdown-item"
                onClick={onLogout}
                type="button"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarHeader;