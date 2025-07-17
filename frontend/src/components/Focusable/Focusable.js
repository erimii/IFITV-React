// src/components/Focusable/Focusable.js
import React, { useEffect, useRef } from "react";
import { useFocus } from "../../context/FocusContext";

function Focusable({ sectionKey, index, children }) {
  const { section, index: currentIndex } = useFocus();
  const ref = useRef(null);
  const isFocused = section === sectionKey && index === currentIndex;

  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.querySelector('input, button, textarea, select')?.focus?.();
    }
  }, [isFocused]);

  return (
    <div
      ref={ref}
      className={`focusable-wrapper ${sectionKey}-section ${isFocused ? "focused" : ""}`}
    >
      {children}
    </div>
  );
}

export default Focusable;
