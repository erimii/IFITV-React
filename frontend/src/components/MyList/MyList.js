import './MyList.css';
import { useState, useEffect } from 'react';
import Focusable from '../Focusable/Focusable';
import { handleCardKeyDownWithSpace } from '../common/cardKeyHandlers';
import styles from '../HomeContentCard.module.css';
import { useFocus } from '../../context/FocusContext';

const MyList = ({ myListContents, onClick, isLoading = false }) => {
  const [selectedContentIds, setSelectedContentIds] = useState([]);
  const { registerSections, setSection, setIndex } = useFocus();
  const { section, index } = useFocus();



  useEffect(() => {
    if (!isLoading && myListContents.length > 0) {
      registerSections({
        'mylist-content': myListContents.length,
      });
      setSection('mylist-content');
      setIndex(0);
    }
  }, [myListContents, isLoading, registerSections, setSection, setIndex]);

  const toggleContent = (content) => {
    onClick?.(content.title);
    setSelectedContentIds((prev) =>
      prev.includes(content.id)
        ? prev.filter(id => id !== content.id)
        : [...prev, content.id]
    );
  };

  return (
    <div className="mylist-page">
      <h1 className="mylist-header">My List</h1>

      {isLoading ? (
        <div className="mylist-grid">
          {Array.from({ length: 30 }).map((_, idx) => (
            <div key={idx} className="mylist-skeleton-card">
              <div className="mylist-skeleton-thumb" />
              <div className="mylist-skeleton-title" />
            </div>
          ))}
        </div>
      ) : myListContents.length === 0 ? (
        <p style={{ color: '#aaa', textAlign: 'center', fontSize: '1.2rem' }}>
          아직 좋아요한 콘텐츠가 없습니다.
        </p>
      ) : (
        <div className="mylist-grid">
          {myListContents.map((item, idx) => (
            <Focusable sectionKey="mylist-content" index={idx} key={item.id}>
            <div
              onClick={() => toggleContent(item)}
              className={`mylist-thumbnail-card ${section === 'mylist-content' && index === idx ? 'focused' : ''}`}
              style={{ cursor: 'pointer' }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' && idx === 0) {
                  setSection('home-sidebar');
                  setIndex(3); // 'My List'의 sidebar index
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                handleCardKeyDownWithSpace(e, () => toggleContent(item));
              }}
              
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                style={{ width: '100%', borderRadius: '8px' }}
              />
              <p className="mylist-title">{item.title}</p>
            </div>
          </Focusable>
          
          ))}
        </div>
      )}
    </div>
  );
};

export default MyList;
