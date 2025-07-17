// src/context/FocusContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const FocusContext = createContext();

export const useFocus = () => useContext(FocusContext);

export const FocusProvider = ({ children }) => {
  const [section, setSection] = useState('menu');      // 현재 섹션 (예: menu, content, profile)
  const [index, setIndex] = useState(0);               // 섹션 내 인덱스

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') setIndex((i) => i + 1);
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
      else if (e.key === 'ArrowDown') setSection((s) => (s === 'menu' ? 'content' : s));
      else if (e.key === 'ArrowUp') setSection((s) => (s === 'content' ? 'menu' : s));
      else if (e.key === 'Enter') {
        document.activeElement?.click?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <FocusContext.Provider value={{ section, index, setSection, setIndex }}>
      {children}
    </FocusContext.Provider>
  );
};
