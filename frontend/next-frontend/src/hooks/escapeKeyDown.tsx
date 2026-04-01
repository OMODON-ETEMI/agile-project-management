import { useEffect } from 'react';

function useOnEscapeKeyDown(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
}

export default useOnEscapeKeyDown;
