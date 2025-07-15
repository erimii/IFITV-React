import { useState, useEffect, useRef } from "react";

function TypingText({ text = "", speed = 50, onComplete, className = "" }) {
  const [displayed, setDisplayed] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!text) return;

    setDisplayed("");
    let i = 0;

    intervalRef.current = setInterval(() => {
      if (i < text.length-1) {
        setDisplayed((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [text, speed, onComplete]);

  return <div className={className}>{displayed}</div>;
}

export default TypingText;
