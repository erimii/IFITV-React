import React, { useEffect, useState } from 'react';

function App() {
  const [contents, setContents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 썸네일 포함된 콘텐츠 리스트 불러오기
  useEffect(() => {
    fetch("http://localhost:5000/titles_with_thumbnails")
      .then(res => res.json())
      .then(data => setContents(data));
  }, []);

  const handleClick = async (title) => {
    console.log("추천요청:",title)

    setLoading(true);
    const response = await fetch("http://localhost:5000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, top_n: 5, alpha: 0.7 }),
    });
    const data = await response.json();
    console.log("추천결과:", data)
    setResults(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🎬 IFITV 예능 추천기</h1>
      <h2>👇 콘텐츠를 선택해보세요</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {contents.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(item.title)}
            style={{
              cursor: 'pointer',
              width: '150px',
              textAlign: 'center',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '0.5rem'
            }}
          >
            <img
              src={item.thumbnail || "https://via.placeholder.com/150"}
              alt={item.title}
              style={{ width: '100%', borderRadius: '4px' }}
            />
            <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{item.title}</p>
          </div>
        ))}
      </div>

      {loading && <p>추천 중입니다...</p>}

      {results.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>✨ 추천 결과</h2>
          <ul>
            {results.map((item, idx) => (
              <li key={idx}>
                <strong>{item.title}</strong> ({item.subgenre})<br />
                📌 {item["추천 근거"]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
