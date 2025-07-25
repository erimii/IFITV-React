import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SidebarHeader.css';
import styles from './SidebarHeader.module.css';
import Focusable from '../Focusable/Focusable';
import { useFocus } from '../../context/FocusContext';
import { useGestureModal } from '../../context/GestureModalContext';

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
  const [vodDropdownOpen, setVodDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  const { showModal } = useGestureModal();
  const { section, index, setSection, setIndex, registerSections } = useFocus();

 /* 후버 후버 구조를 위해,, */
  const [subgenresByGenre, setSubgenresByGenre] = useState([]);
  const [hoveredGenre, setHoveredGenre] = useState(null);

  useEffect(() => {
    const fetchGenresWithSubgenres = async () => {
      try {
        const res = await axios.get("http://localhost:8000/recommendation/genres_with_subgenres/");
        setSubgenresByGenre(res.data);
        console.log("장르 + 서브장르 응답 확인", res.data);
      } catch (error) {
        console.error("장르 + 서브장르 가져오기 오류:", error);
      }
    };
  
    fetchGenresWithSubgenres();
  }, []);

  // home-sidebar의 index 최대값(0~6, 총 7개) 등록
  useEffect(() => {
    registerSections({
      'home-sidebar': 7,
      'home-sidebar-flyout': subgenresByGenre.length,
      'home-sidebar-subgenre':
        (hoveredGenre && subgenresByGenre.find(g => g.id === hoveredGenre)?.subgenres?.length) || 0
    });
  }, [registerSections, subgenresByGenre, hoveredGenre]);

  // VOD 포커싱 시 flyout 상태 관리
  useEffect(() => {
    if (section !== 'home-sidebar-flyout' && section !== 'home-sidebar-subgenre') {
      // VOD가 아닌 다른 항목에 포커스되면 flyout 닫기
      setVodDropdownOpen(false);
      setHoveredGenre(null);
    }
  }, [section, index]);

  // 장르 포커싱 시 서브장르 flyout 자동 열기
  useEffect(() => {
    if (section === 'home-sidebar-flyout' && subgenresByGenre[index]) {
      setHoveredGenre(subgenresByGenre[index].id);
    }
  }, [section, index, subgenresByGenre]);
  

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

  // 키보드 이벤트 핸들러 (Enter/Space 키 추가)
  const maxSidebarIndex = 6; // Home(0) ~ 설정(6)까지
  const handleSidebarKeyDown = (e, itemIndex) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      
      // 각 항목별 onClick 함수 호출
      if (itemIndex === 0) {
        onSelect('Home'); // 'Home'에서 'Home'으로 수정
      } else if (itemIndex === 1) {
        onSelect('Live');
        setTimeout(() => {
          setSection('live-slider-0'); // Live 컴포넌트의 첫 섹션
          setIndex(0);                 // 첫 콘텐츠
        }, 0);
      } else if (itemIndex === 2) {
        onSelect('VOD');
      } else if (itemIndex === 3) {
        onSelect('My List');
      } else if (itemIndex === 4) {
        showModal(profiles, (matchedProfile) => {
          setSelectedProfile?.(matchedProfile);
          navigate("/home");
        });
      } else if (itemIndex === 5) {
        showModal(profiles, (matchedProfile) => {
          setSelectedProfile?.(matchedProfile);
          navigate("/home");
        });
      } else if (itemIndex === 6) {
        setSettingsDropdownOpen(prev => !prev);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      if (itemIndex === 2) { // VOD 항목
        setVodDropdownOpen(true); // flyout 열기 상태 유지
        setSection('home-sidebar-flyout');
        setIndex(0);
      }else if (itemIndex === 2) { // VOD에서 오른쪽 → 눌렀을 때
        setSection('vod-content');
        setIndex(0);
      }else if (itemIndex === 3) { // My List에서 오른쪽 → 눌렀을 때
        setSection('mylist-content');
        setIndex(0);
      } else if (itemIndex === 6) { // 설정 항목
        setSettingsDropdownOpen(true);
        setSection('home-sidebar-settings');
        setIndex(0);
      } else {
        setSection('home-slider-0');
        setIndex(0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      const nextIndex = Math.min(itemIndex + 1, maxSidebarIndex); // 0-6 범위
      setIndex(nextIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const prevIndex = Math.max(itemIndex - 1, 0);
      setIndex(prevIndex);
    }
  };


  const handleSettingsKeyDown = (e, settingIndex) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (settingIndex === 0) {
        onEditProfile();
      } else if (settingIndex === 1) {
        onLogout();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      setSection('home-sidebar');
      setIndex(5); // 설정 버튼으로 돌아가기
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      const nextIndex = Math.min(settingIndex + 1, 1);
      setIndex(nextIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const prevIndex = Math.max(settingIndex - 1, 0);
      setIndex(prevIndex);
    }
  };

  return (
    <aside className="sidebar-header">
      <div className="sidebar-logo">IFITV</div>
      <div className="sidebar-focus-group">
        {['Home', 'Live', 'VOD', 'My List'].map((menu, i) => (
          <Focusable key={menu} sectionKey="home-sidebar" index={i}>
            <div
              className={`${styles['sidebar-flyout-toggle']} ${selectedMenu === menu ? styles.active : ''} ${section === 'home-sidebar' && index === i ? styles.focused : ''}`}
              onClick={() => onSelect(menu)}
              onKeyDown={(e) => handleSidebarKeyDown(e, i)}
              tabIndex={0}
            >
              {menu}
            </div>
          </Focusable>
        ))}
        {/* VOD flyout: VOD Focusable(index=2) 바로 아래에 위치 */}
        {vodDropdownOpen && (
          <div className="vod-flyout-wrapper"
            onMouseLeave={() => {
              setVodDropdownOpen(false);
              setSection('home-sidebar');
              setIndex(2); // VOD로 복귀
            }}
          >
            <div className="sidebar-flyout-menu">
              {subgenresByGenre.map((genreObj, genreIdx) => (
                <Focusable sectionKey="home-sidebar-flyout" index={genreIdx} key={genreObj.id}>
                  <div
                    className="sidebar-flyout-group"
                    onMouseEnter={() => setHoveredGenre(genreObj.id)}
                  >
                    <button
                      className={`sidebar-flyout-item ${hoveredGenre === genreObj.id ? 'active' : ''} ${section === 'home-sidebar-flyout' && index === genreIdx ? 'focused' : ''}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') {
                          setVodDropdownOpen(false);
                          setSection('home-sidebar');
                          setIndex(2); // VOD로 복귀
                        } else if (e.key === 'ArrowRight') {
                          setSection('home-sidebar-subgenre');
                          setIndex(0);
                        }
                      }}
                    >
                      {genreObj.name}
                    </button>
                  </div>
                </Focusable>
              ))}
            </div>
            {/* 서브장르 flyout */}
            {hoveredGenre && (
              <div className="sidebar-subgenre-menu">
                {subgenresByGenre
                  .find((g) => g.id === hoveredGenre)
                  ?.subgenres.map((sub, subIdx) => (
                    <Focusable sectionKey="home-sidebar-subgenre" index={subIdx} key={sub.id}>
                      <button
                        className={`sidebar-flyout-item ${section === 'home-sidebar-subgenre' && index === subIdx ? 'focused' : ''}`}
                        style={{ fontSize: '0.95rem' }}
                        onClick={() => {
                          handleSubgenreSelect(sub);
                          setVodDropdownOpen(false);
                          setSection('home-slider-0');
                          setIndex(0);
                        }}
                        tabIndex={0}
                      >
                        {sub.name}
                      </button>
                    </Focusable>
                  ))}
              </div>
            )}
          </div>
        )}
        <Focusable sectionKey="home-sidebar" index={4}>
        <button
          className={`${styles.searchButton} ${section === 'home-sidebar' && index === 4 ? styles.focused : ''}`}
          onClick={() => setSearchOpen(true)}
          aria-label="검색 열기"
          onKeyDown={(e) => handleSidebarKeyDown(e, 4)}
          tabIndex={0}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="17" y1="17" x2="21" y2="21" />
            </svg>
          </button>
        </Focusable>


      </div>
      {searchOpen && (
        <form className="search-form" onSubmit={handleSearchSubmit} style={{ position: 'absolute', left: 0, right: 0, zIndex: 100 }}>
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

      <div className="sidebar-profile">
        <Focusable sectionKey="home-sidebar" index={5}>
          <div className="sidebar-gesture">
            <button
              onClick={() => showModal(profiles, (matchedProfile) => {
                setSelectedProfile?.(matchedProfile);
                navigate("/home");
              })}
              className={`gesture-button ${section === 'home-sidebar' && index === 5 ? 'focused' : ''}`}
              aria-label="프로필 제스처 전환"
              tabIndex={0}
              onKeyDown={(e) => handleSidebarKeyDown(e, 5)}
            >
              <span className="gesture-emoji">
                {currentProfile?.gesture === "scissors" && "✌️"}
                {currentProfile?.gesture === "rock" && "✊"}
                {currentProfile?.gesture === "paper" && "🖐"}
                {currentProfile?.gesture === "ok" && "👌"}
              </span>
            </button>
            <div className="profile-name">{currentProfile.name}</div>
            {/* GestureModal 컴포넌트는 이제 직접 호출하지 않고, 컨텍스트에서 관리 */}
          </div>
        </Focusable>
        {/* 설정(톱니바퀴) 드롭다운 */}
        <Focusable sectionKey="home-sidebar" index={6}>
          <div
            className="sidebar-dropdown"
            ref={settingsRef}
            style={{ width: '100%', textAlign: 'center', marginTop: 2 }}
            onMouseEnter={() => setSettingsDropdownOpen(true)}
            onMouseLeave={() => setSettingsDropdownOpen(false)}
          >
            <button
              className={`sidebar-dropdown-item settings-gear-btn ${section === 'home-sidebar' && index === 6 ? 'focused' : ''}`}
              aria-label="설정"
              tabIndex={0}
              onKeyDown={(e) => handleSidebarKeyDown(e, 6)}
            >
              {/* Google Settings SVG 아이콘 */}
              <svg className="settings-gear-icon" viewBox="0 0 24 24">
                <path d="M19.14,12.94a7,7,0,0,0,0-1.88l2.11-1.65a.5.5,0,0,0,.12-.64l-2-3.46a.5.5,0,0,0-.61-.23l-2.49,1a7,7,0,0,0-1.6-.93l-.38-2.65A.5.5,0,0,0,13.5,2h-4a.5.5,0,0,0-.5.42l-.38,2.65a7,7,0,0,0-1.6.93l-2.49-1a.5.5,0,0,0-.61.23l-2,3.46a.5.5,0,0,0,.12.64l2.11,1.65a7,7,0,0,0,0,1.88l-2.11,1.65a.5.5,0,0,0-.12.64l2,3.46a.5.5,0,0,0,.61.23l2.49-1a7,7,0,0,0,1.6.93l.38,2.65A.5.5,0,0,0,9.5,22h4a.5.5,0,0,0,.5-.42l.38-2.65a7,7,0,0,0,1.6-.93l2.49,1a.5.5,0,0,0,.61-.23l2-3.46a.5.5,0,0,0-.12-.64ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
              </svg>
            </button>
          </div>
        </Focusable>
        
        {/* 설정 flyout을 별도로 분리 */}
        {settingsDropdownOpen && (
          <div className="sidebar-dropdown-menu">
            <Focusable sectionKey="home-sidebar-settings" index={0}>
              <button
                className={`sidebar-dropdown-item ${section === 'home-sidebar-settings' && index === 0 ? 'focused' : ''}`}
                onClick={onEditProfile}
                type="button"
                tabIndex={0}
                onKeyDown={(e) => handleSettingsKeyDown(e, 0)}
              >
                프로필 수정
              </button>
            </Focusable>
            <Focusable sectionKey="home-sidebar-settings" index={1}>
              <button
                className={`sidebar-dropdown-item ${section === 'home-sidebar-settings' && index === 1 ? 'focused' : ''}`}
                onClick={onLogout}
                type="button"
                tabIndex={0}
                onKeyDown={(e) => handleSettingsKeyDown(e, 1)}
              >
                로그아웃
              </button>
            </Focusable>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarHeader;