import React, { createContext, useState, useCallback } from 'react';
import type { ModalType, ModalContextType } from '../types';

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalType>(null);

  const openModal = useCallback((modalType: ModalType) => {
    // Cast to ModalType to satisfy TypeScript when the argument is a string literal
    setModal(modalType as ModalType);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const value = { modal, openModal, closeModal };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
