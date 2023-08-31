"use client";

import { useState } from "react";

interface AppModalProps {
  isCentered?: boolean;
  modalClassname?: string;
  children: React.ReactNode;
}

const useAppModal = (defaultState = false, shouldNavigate = false): any[] => {
  const [isOpen, setIsOpen] = useState(defaultState);

  const closeModal = () => {
    if (shouldNavigate) {
      document.body.classList.remove("no-scroll");
    } else {
      setIsOpen(false);
      document.body.classList.remove("no-scroll");
    }
  };

  const openModal = () => {
    setIsOpen(true);
    document.body.classList.add("no-scroll");
  };

  const AppModal = ({
    children,
    modalClassname,
    isCentered = true,
  }: AppModalProps) => {
    return (
      <>
        {isOpen && (
          <>
            <div className="app-modal-overlay" onClick={closeModal}></div>
            <div
              className={`app-modal ${isCentered ? "app-modal-centered" : ""} ${
                modalClassname ?? ""
              } `}
            >
              {children}
            </div>
          </>
        )}
      </>
    );
  };

  return [AppModal, closeModal, openModal, isOpen];
};

export default useAppModal;
