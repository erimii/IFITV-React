// src/context/FocusContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FocusContext = createContext();

export const useFocus = () => useContext(FocusContext);

export const FocusProvider = ({ children }) => {
  const [section, setSection] = useState('home-sidebar');
  const [index, setIndex] = useState(0);

  const [sectionOrder, setSectionOrder] = useState(['home-sidebar']); // 동적으로 갱신 가능

  // 아래에서 등록하는 함수로 section 순서 설정 가능
  const registerSections = useCallback((sections) => {
    console.log("[REGISTER SECTIONS]", sections);
    setSectionOrder(sections);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 폼 요소에 포커스가 있을 때 방향키는 전역 핸들러에서 처리, 그 외 키는 native로 넘김
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isFormElement = ["input", "select", "textarea", "button"].includes(tag);
      if (isFormElement && !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        return;
      }
      console.log("[FOCUS CONTEXT KEYDOWN]", e.key, "current section:", section, "current index:", index);
      
      // 현재 섹션이 등록된 섹션 목록에 없으면 home-sidebar로 리셋
      if (!sectionOrder.includes(section)) {
        console.log("[FOCUS CONTEXT] Current section not in sectionOrder, resetting to home-sidebar");
        setSection('home-sidebar');
        setIndex(0);
        return;
      }
      
      // 슬라이더 섹션에서는 기본 핸들러를 실행하지 않음
      if (section.startsWith('home-slider-')) {
        console.log("[FOCUS CONTEXT] Skipping default handler for slider section");
        return;
      }
      
      if (e.key === 'ArrowRight') {
        console.log("[FOCUS CONTEXT] ArrowRight - incrementing index");
        setIndex((i) => i + 1);
      }
      else if (e.key === 'ArrowLeft') {
        console.log("[FOCUS CONTEXT] ArrowLeft - decrementing index");
        setIndex((i) => Math.max(i - 1, 0));
      }
      else if (e.key === 'ArrowDown') {
        if (sectionOrder.length === 1) {
          setIndex((i) => i + 1);
        } else {
          const currentIdx = sectionOrder.indexOf(section);
          if (currentIdx !== -1 && currentIdx < sectionOrder.length - 1) {
            setSection(sectionOrder[currentIdx + 1]);
            setIndex(0);
          }
        }
      } else if (e.key === 'ArrowUp') {
        if (sectionOrder.length === 1) {
          setIndex((i) => Math.max(i - 1, 0));
        } else {
          const currentIdx = sectionOrder.indexOf(section);
          if (currentIdx > 0) {
            setSection(sectionOrder[currentIdx - 1]);
            setIndex(0);
          }
        }
      } else if (e.key === 'Enter') {
        document.activeElement?.click?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [section, sectionOrder, index]);

  return (
    <FocusContext.Provider value={{ section, index, setSection, setIndex, registerSections }}>
      {children}
    </FocusContext.Provider>
  );
};
