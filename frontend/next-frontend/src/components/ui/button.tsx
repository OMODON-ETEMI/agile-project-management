"use client"

import React, { forwardRef } from 'react';

// Import your existing Icon and Spinner components here
import { Spinner } from './skeleton';
import Icon, { IconType } from '@/src/helpers/icon';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'success' | 'error' | 'secondary' | 'empty' | 'warning' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: IconType | React.ReactNode;
  iconSize?: number;
  isWorking?: boolean;
  href?: string;
  isAnchor?: boolean;
}

const Button: React.FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant = 'secondary', size = 'md', icon, iconSize = 18, disabled = false, isWorking = false, onClick, href, isAnchor=false, ...buttonProps },
    ref
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isWorking && onClick) {
        onClick(event);
      }
    };

    const getIconColor = (variant: ButtonProps['variant']) =>
      ['secondary', 'empty', 'outline', 'ghost'].includes(variant!) ? 'text-gray-700' : 'text-white';

    const buttonVariantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      error: 'bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c]', // Red shades for error
      warning: 'bg-[#f59e0b] text-white hover:bg-[#d97706] active:bg-[#b45309]', // Yellow shades for warning
      success: 'bg-[#10b981] text-white hover:bg-[#059669] active:bg-[#047857]', // Green shades for success
      info: 'bg-[#3b82f6] text-white hover:bg-[#2563eb] active:bg-[#1d4ed8]', // Blue shades for info
      secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400', // Neutral secondary
      empty: 'bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200', // White/empty button
      outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    };

    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 py-2',
      lg: 'h-12 px-8 text-base',
      icon: 'h-9 w-9',
    };

    const content = (
      <>
        {isWorking ? (
          <Spinner size="sm" className={getIconColor(variant)} />
        ) : typeof icon === 'string' ? (
          <Icon type={icon as IconType} size={iconSize} className={getIconColor(variant)} />
        ) : (
          icon
        )}
        {children && <span className={`pl-${isWorking || icon ? 2 : 0}`}>{children}</span>}
      </>
    );

    const baseClasses = `flex items-center justify-center transition-all duration-100 rounded-sm ${
      sizeClasses[size!]
    } ${
      buttonVariantClasses[variant!]
    } ${disabled || isWorking ? 'opacity-60 cursor-not-allowed' : ''} ${buttonProps.className || ''}`;

    // Render Link, anchor, or button
    if (href) {
      if (isAnchor) {
        return (
          <a
            href={href}
            onClick={handleClick}
            className={baseClasses}
            {...(buttonProps as any)}
          >
            {content}
          </a>
        );
      }
      return (
        <Link href={href} className={baseClasses} {...(buttonProps as any)}>
          {content}
        </Link>
      );
    }
    

    return (
      <button
        {...buttonProps}
        ref={ref}
        onClick={handleClick}
        disabled={disabled || isWorking}
        className={baseClasses}
      >
        {content}
      </button>
    );
  }
);

export default Button;
