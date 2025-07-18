// src/context/FocusContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const FocusContext = createContext();

export const useFocus = () => useContext(FocusContext);

export const FocusProvider = ({ children }) => {
  const [section, setSection] = useState('menu');
  const [index, setIndex] = useState(0);

  const [sectionOrder, setSectionOrder] = useState(['menu']); // 동적으로 갱신 가능

  // 아래에서 등록하는 함수로 section 순서 설정 가능
  const registerSections = (sections) => {
    setSectionOrder(sections);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') setIndex((i) => i + 1);
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
      else if (e.key === 'ArrowDown') {
        const currentIdx = sectionOrder.indexOf(section);
        if (currentIdx !== -1 && currentIdx < sectionOrder.length - 1) {
          setSection(sectionOrder[currentIdx + 1]);
          setIndex(0);
        }
      } else if (e.key === 'ArrowUp') {
        const currentIdx = sectionOrder.indexOf(section);
        if (currentIdx > 0) {
          setSection(sectionOrder[currentIdx - 1]);
          setIndex(0);
        }
      } else if (e.key === 'Enter') {
        document.activeElement?.click?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [section, sectionOrder]);

  return (
    <FocusContext.Provider value={{ section, index, setSection, setIndex, registerSections }}>
      {children}
    </FocusContext.Provider>
  );
};
