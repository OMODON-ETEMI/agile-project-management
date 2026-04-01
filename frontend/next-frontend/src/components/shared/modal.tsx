"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import useOnOutsideClick from './outsideClick';
import useOnEscapeKeyDown from './escapeKeyDown';
import Button from './button';

interface ModalProps {
  className?: string;
  testid?: string;
  variant?: 'center' | 'aside';
  width?: number;
  withCloseIcon?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  renderLink?: (props: { open: () => void }) => React.ReactNode;
  renderContent: (props: { close: () => void }) => React.ReactNode;
}

const defaultProps: Partial<ModalProps> = {
  className: undefined,
  testid: 'modal',
  variant: 'center',
  width: 600,
  withCloseIcon: true,
  isOpen: undefined,
  onClose: () => {},
  renderLink : ({ open }) => <button onClick={open}>Open Modal</button>,
};

const Modal: React.FC<ModalProps> = ({
  className,
  testid,
  variant = 'center',
  width = 600,
  withCloseIcon = true,
  isOpen: propsIsOpen,
  onClose: tellParentToClose,
  renderLink,
  renderContent,
}) => {
  const [stateIsOpen, setStateOpen] = useState(false);
  const isControlled = typeof propsIsOpen === 'boolean';
  const isOpen = isControlled ? propsIsOpen : stateIsOpen;

  const modalRef = useRef<HTMLDivElement>(null);
  const clickableOverlayRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    if (!isControlled) {
      setStateOpen(false);
    } else {
      tellParentToClose?.();
    }
  }, [isControlled, tellParentToClose]);

  // useOnOutsideClick(modalRef, isOpen, closeModal, clickableOverlayRef);
  useOnEscapeKeyDown(isOpen, closeModal);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }

    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [isOpen]);

  return (
    <>
      {!isControlled && renderLink?.({ open: () => setStateOpen(true) })}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black rounded-sm bg-opacity-50 overflow-y-auto">
          <div
            ref={clickableOverlayRef}
            className={`min-h-screen flex items-center justify-center ${
              variant === 'center' ? 'p-4' : ''
            }`}
          >
            <div
              ref={modalRef}
              className={`bg-white p-4 relative ${
                variant === 'center' ? 'rounded-lg shadow-lg' : 'shadow-2xl'
              }`}
              style={{ maxWidth: width, width: '100%' }}
              data-testid={testid}
            >
              {withCloseIcon && (
                <Button
                  onClick={closeModal}
                  icon="close"
                  variant='empty'
                  className="absolute top-2 right-2 text-gray-600 hover:text-black"
                />
              )}
              {renderContent({ close: closeModal })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

Modal.defaultProps = defaultProps;

export default Modal;
