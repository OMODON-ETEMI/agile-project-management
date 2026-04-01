// components/MemberAvatar.tsx
import React from 'react';

interface MemberAvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({ 
  name, 
  color = '#6366f1', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-semibold
      `}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};