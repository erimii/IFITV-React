import './MyList.css';
import { useState } from 'react';

const MyList = ({ myListContents, onClick }) => {
  const [selectedContentIds, setSelectedContentIds] = useState([]);

  const toggleContent = (content) => {
    onClick?.(content.title);  // 기존 동작 유지
    setSelectedContentIds((prev) =>
      prev.includes(content.id)
        ? prev.filter(id => id !== content.id)
        : [...prev, content.id]
    );
  };

  return (
    <div className="mylist-page">
      <h1 className="mylist-header">My List</h1>
      
      {myListContents.length === 0 ? (
        <p style={{ color: '#aaa', textAlign: 'center', fontSize: '1.2rem' }}>
          아직 좋아요한 콘텐츠가 없습니다.
        </p>
      ) : (
        <div className="mylist-grid">
          {myListContents.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleContent(item)}
              className={"content-card"}
            >
              <img src={item.thumbnail} alt={item.title} />
              <div className="content-card-title">{item.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyList;
