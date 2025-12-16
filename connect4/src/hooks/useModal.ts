import { useState, useEffect } from "react";

function useModal(ref: React.RefObject<HTMLFormElement | null>) {
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return {modalOpen, setModalOpen};
}

export default useModal;
