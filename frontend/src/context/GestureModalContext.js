import React, { createContext, useContext, useState } from 'react';

const GestureModalContext = createContext();

export function useGestureModal() {
  return useContext(GestureModalContext);
}

export function GestureModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [onRecognized, setOnRecognized] = useState(() => () => {});

  const showModal = (profiles, onRecognized) => {
    setProfiles(profiles);
    setOnRecognized(() => onRecognized);
    setOpen(true);
  };
  
  const closeModal = () => setOpen(false);

  return (
    <GestureModalContext.Provider value={{ open, showModal, closeModal, profiles, onRecognized }}>
      {children}
    </GestureModalContext.Provider>
  );
} 