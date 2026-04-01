// components/ConfirmModal.tsx
"use client"
import React, { useState } from 'react';
import Button from './button';

interface ConfirmModalProps {
  className?: string;
  variant?: 'primary' | 'empty';
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (args: { close: () => void }) => void;
  renderLink: (args: { openModal: () => void }) => React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  className = '',
  variant = 'primary',
  title = 'Warning',
  message = 'Are you sure you want to continue with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  renderLink,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWorking, setWorking] = useState(false);

  const handleConfirm = () => {
    setWorking(true);
    onConfirm({
      close: () => {
        setIsOpen(false);
        setWorking(false);
      },
    });
  };

  return (
    <>
      {renderLink({ openModal: () => setIsOpen(true) })}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-400 bg-opacity-50">
          <div className={`bg-white rounded-md shadow-xl p-8 max-w-md w-full ${className}`} data-testid="modal:confirm">
            <h2 className="text-lg font-medium mb-5 leading-6">{title}</h2>
            {message && <p className="text-base mb-6 whitespace-pre-wrap">{message}</p>}
            <div className="flex items-center justify-end space-x-4 mt-2">
              <Button
                variant='primary'
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
              >
                {cancelText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmModal;