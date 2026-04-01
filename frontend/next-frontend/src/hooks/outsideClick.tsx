import { over } from 'lodash';
import { useEffect } from 'react';

function useOnOutsideClick(
  ref: React.RefObject<HTMLElement>,
  isOpen: boolean,
  onClose: () => void,
  overlayRef?: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        (!overlayRef?.current ||  overlayRef?.current?.contains(event.target as Node))
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, ref, overlayRef, onClose]);
}

export default useOnOutsideClick;
