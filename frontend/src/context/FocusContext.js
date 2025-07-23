// src/context/FocusContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FocusContext = createContext();

export const useFocus = () => useContext(FocusContext);

export const FocusProvider = ({ children }) => {
  const [section, setSection] = useState('home-sidebar');
  const [index, setIndex] = useState(0);

  // sectionOrder를 객체({ sectionKey: maxIndex })로 관리
  const [sectionOrder, setSectionOrder] = useState({ 'home-sidebar': 1 }); // { sectionKey: maxIndex+1 }

  // 아래에서 등록하는 함수로 section별 최대 인덱스 설정 가능
  const registerSections = useCallback((sections) => {
    // sections: { sectionKey: maxIndex+1 }
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
      if (!Object.keys(sectionOrder).includes(section)) {
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

      // select-content 섹션 간 이동 (SelectContentPage 전용)
      if (section.startsWith('select-content-') || section === 'select-content-btns') {
        // 섹션 순서 배열 만들기
        const sectionKeys = Object.keys(sectionOrder).filter(key => key.startsWith('select-content-')).sort((a, b) => {
          // 숫자 순 정렬
          const aNum = parseInt(a.replace('select-content-', ''), 10);
          const bNum = parseInt(b.replace('select-content-', ''), 10);
          return aNum - bNum;
        });
        sectionKeys.push('select-content-btns');
        const currentIdx = sectionKeys.indexOf(section);

        if (e.key === 'ArrowDown') {
          if (currentIdx < sectionKeys.length - 1) {
            setSection(sectionKeys[currentIdx + 1]);
            setIndex(0);
            e.preventDefault();
            return;
          }
        }
        if (e.key === 'ArrowUp') {
          if (currentIdx > 0) {
            setSection(sectionKeys[currentIdx - 1]);
            setIndex(0);
            e.preventDefault();
            return;
          }
        }
      }

      if (e.key === 'ArrowRight') {
        setIndex((i) => Math.min(i + 1, (sectionOrder[section] || 1) - 1));
      }
      else if (e.key === 'ArrowLeft') {
        setIndex((i) => Math.max(i - 1, 0));
      }
      else if (e.key === 'ArrowDown') {
        // index 최대값 체크
        if (index < (sectionOrder[section] || 1) - 1) {
          setIndex((i) => i + 1);
        } else {
          // 다음 section으로 이동 (여러 section 지원 시)
        }
      } else if (e.key === 'ArrowUp') {
        if (index > 0) {
          setIndex((i) => Math.max(i - 1, 0));
        } else {
          // 이전 section으로 이동 (여러 section 지원 시)
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
