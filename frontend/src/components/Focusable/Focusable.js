// src/components/Focusable/Focusable.js
import React, { useEffect, useRef } from "react";
import { useFocus } from "../../context/FocusContext";

function Focusable({ sectionKey, index, context, children }) {
  const { section, index: currentIndex } = useFocus();
  const ref = useRef(null);
  const isFocused = section === sectionKey && index === currentIndex;

  useEffect(() => {
    if (isFocused && ref.current) {
      // input, select, button, [tabindex]:not([tabindex="-1"]) 중 첫 번째에 포커스
      const focusableElement =
        ref.current.querySelector('input, select, button, [tabindex]:not([tabindex="-1"])') || ref.current;
      focusableElement.focus();
      // 디버깅용 로그
      console.log('[FOCUSABLE]', sectionKey, index, 'isFocused:', isFocused, 'focusableElement:', focusableElement);
    }
  }, [isFocused, sectionKey, index]);

  return (
    <div
      ref={ref}
      className={`focusable-wrapper ${sectionKey}-section${isFocused ? ' focused' : ''}${context ? ' ' + context : ''}`}
    >
      {children}
    </div>
  );
}

export default Focusable;
