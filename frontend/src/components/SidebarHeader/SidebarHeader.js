import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GestureModal from '../GestureModal/GestureModal';

import './SidebarHeader.css';

const LIVE_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'news', name: 'News' },
  { id: 'drama', name: 'Drama' },
  { id: 'sports', name: 'Sports' },
  { id: 'music', name: 'Music' },
  { id: 'talkshow', name: 'Talk Show' }
];

const VOD_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'news', name: 'News' },
  { id: 'drama', name: 'Drama' },
  { id: 'sports', name: 'Sports' },
  { id: 'talkshow', name: 'Talk Show' }
];

const GENRE_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'variety', name: 'Variety' },
  { id: 'documentary', name: 'Documentary' },
  { id: 'reality', name: 'Reality' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'drama', name: 'Drama' }
];

const SidebarHeader = ({
  onLogout,
  currentProfile,
  profiles,
  setSelectedProfile,
  onEditProfile,
  selectedMenu,
  onSelect
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

  const liveParams = new URLSearchParams(location.pathname.startsWith('/live') ? location.search : '');
  const selectedLiveCategory = location.pathname.startsWith('/live')
    ? (liveParams.get('category') || 'all')
    : null;

  const vodParams = new URLSearchParams(location.pathname.startsWith('/vod') ? location.search : '');
  const selectedVodCategory = location.pathname.startsWith('/vod')
    ? (vodParams.get('category') || 'all')
    : null;

  const genreParams = new URLSearchParams(location.pathname.startsWith('/genres') ? location.search : '');
  const selectedGenreCategory = location.pathname.startsWith('/genres')
    ? (genreParams.get('category') || 'all')
    : null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  const handleLiveCategoryClick = (id) => {
    navigate(`/live?category=${id}`);
    setTimeout(() => setLiveDropdownOpen(false), 0);
  };

  const handleVodCategoryClick = (id) => {
    navigate(`/vod?category=${id}`);
    setTimeout(() => setVodDropdownOpen(false), 0);
  };

  const handleGenreCategoryClick = (id) => {
    navigate(`/genres?category=${id}`);
    setTimeout(() => setGenreDropdownOpen(false), 0);
  };

  return (
    <aside className="sidebar-header">
      <div className="sidebar-logo">
        IFITV
      </div>
      <nav className="sidebar-nav"> 
        <div
            className={`sidebar-dropdown-toggle ${selectedMenu === '홈' ? 'active' : ''}`}
            onClick={() => onSelect('홈')}
        >
            Home
        </div>
        {/* Live 메뉴 */}
        <div
            className="sidebar-dropdown"
            onMouseEnter={() => setLiveDropdownOpen(true)}
            onMouseLeave={() => setLiveDropdownOpen(false)}
            >
            <div
                className={`sidebar-dropdown-toggle ${selectedMenu === 'LIVE' ? 'active' : ''}`}
                onClick={() => onSelect('LIVE')}
            >
                Live
            </div>

            {liveDropdownOpen && (
                <div className="sidebar-dropdown-menu">
                {LIVE_CATEGORIES.map((category, idx) => (
                    <React.Fragment key={category.id}>
                    <button
                        className={
                        'sidebar-dropdown-item' +
                        (selectedLiveCategory === category.id ? ' active' : '')
                        }
                        onClick={() => handleLiveCategoryClick(category.id)}
                        type="button"
                    >
                        {category.name}
                    </button>
                    {idx !== LIVE_CATEGORIES.length - 1 && (
                        <div className="dropdown-divider" />
                    )}
                    </React.Fragment>
                ))}
                </div>
            )}
        </div>

        {/* VOD 메뉴 드롭다운 */}
        <div
          className="sidebar-dropdown"
          onMouseEnter={() => setVodDropdownOpen(true)}
          onMouseLeave={() => setVodDropdownOpen(false)}
        >
          <div
            className={`sidebar-dropdown-toggle ${selectedMenu === 'VOD' ? 'active' : ''}`}
            onClick={() => onSelect('VOD')}
            >
            VOD
          </div>
          {vodDropdownOpen && (
            <div className="sidebar-dropdown-menu">
              {VOD_CATEGORIES.map((category, idx) => (
                <React.Fragment key={category.id}>
                  <button
                    className={
                      'sidebar-dropdown-item' +
                      (selectedVodCategory === category.id ? ' active' : '')
                    }
                    onClick={() => handleVodCategoryClick(category.id)}
                    type="button"
                  >
                    {category.name}
                  </button>
                  {idx !== VOD_CATEGORIES.length - 1 && (
                    <div className="dropdown-divider" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        {/* Genres 메뉴 드롭다운 */}
        <div
          className="sidebar-dropdown"
          onMouseEnter={() => setGenreDropdownOpen(true)}
          onMouseLeave={() => setGenreDropdownOpen(false)}
        >
          <div
            className={`sidebar-dropdown-toggle ${selectedMenu === 'Genres' ? 'active' : ''}`}
            onClick={() => {}}
            >
            Genres
          </div>
          {genreDropdownOpen && (
            <div className="sidebar-dropdown-menu">
              {GENRE_CATEGORIES.map((category, idx) => (
                <React.Fragment key={category.id}>
                  <button
                    className={
                      'sidebar-dropdown-item' +
                      (selectedGenreCategory === category.id ? ' active' : '')
                    }
                    onClick={() => handleGenreCategoryClick(category.id)}
                    type="button"
                  >
                    {category.name}
                  </button>
                  {idx !== GENRE_CATEGORIES.length - 1 && (
                    <div className="dropdown-divider" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <div
            className={`sidebar-dropdown-toggle ${selectedMenu === 'My List' ? 'active' : ''}`}
            onClick={() => onSelect('My List')}
        >
            My List
        </div>
      </nav>
      <div className="sidebar-search">
        <span
          className="search-icon"
          onClick={() => setSearchOpen(v => !v)}
          style={{ cursor: 'pointer' }}
        >🔍</span>
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
            >✖️</button>
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