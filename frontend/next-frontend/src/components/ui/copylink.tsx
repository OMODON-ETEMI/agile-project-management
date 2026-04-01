"use client"

import React, { useState } from 'react';

// import { copyToClipboard } from './textArea';
import Button  from './button'

interface CopyLinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({ ...buttonProps }) => {
  const [isLinkCopied, setLinkCopied] = useState<boolean>(false);

  const handleLinkCopy = () => {
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    // copyToClipboard(window.location.href);
  };

  return (
    <div className='inline-flex items-center text-gray-500 text-xs'>
      <Button icon="link" variant='empty' iconSize={12}
        onClick={handleLinkCopy} 
        {...buttonProps}>
        {isLinkCopied ? 'Link Copied' : 'Copy link'}
      </Button>
    </div>
  );
};

export default CopyLinkButton;
