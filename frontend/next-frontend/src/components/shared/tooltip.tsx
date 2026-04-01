import React, { Fragment, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  className?: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  offset?: { top: number; left: number };
  width: number;
  renderLink: (props: { ref: React.RefObject<HTMLDivElement>; onClick: () => void }) => React.ReactNode;
  renderContent: (props: { close: () => void }) => React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  className,
  placement = 'bottom',
  offset = { top: 0, left: 0 },
  width,
  renderLink,
  renderContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  const linkRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const openTooltip = () => setIsOpen(true);
  const closeTooltip = () => setIsOpen(false);

  useOnOutsideClick([tooltipRef, linkRef], isOpen, closeTooltip);

  useLayoutEffect(() => {
    setPortalContainer(document.body);

    const setTooltipPosition = () => {
      const { top, left } = calcPosition(offset, placement, tooltipRef, linkRef);
      if (tooltipRef.current) {
        tooltipRef.current.style.top = `${top}px`;
        tooltipRef.current.style.left = `${left}px`;
      }
    };

    if (isOpen) {
      setTooltipPosition();
      window.addEventListener('resize', setTooltipPosition);
      window.addEventListener('scroll', setTooltipPosition);
    }

    return () => {
      window.removeEventListener('resize', setTooltipPosition);
      window.removeEventListener('scroll', setTooltipPosition);
    };
  }, [isOpen, offset, placement]);

  return (
    <Fragment>
      {renderLink({ ref: linkRef, onClick: isOpen ? closeTooltip : openTooltip })}

      {isOpen && portalContainer &&
        createPortal(
          <div
            className={`fixed z-50 rounded-md bg-white shadow-lg ${className}`}
            ref={tooltipRef}
            style={{ width }}
          >
            {renderContent({ close: closeTooltip })}
          </div>,
          portalContainer
        )}
    </Fragment>
  );
};

const calcPosition = (
  offset: { top: number; left: number },
  placement: 'top' | 'right' | 'bottom' | 'left',
  tooltipRef: React.RefObject<HTMLDivElement>,
  linkRef: React.RefObject<HTMLDivElement>
) => {
  const margin = 10;
  const finalOffset = { ...offset };

  const tooltipRect = tooltipRef.current?.getBoundingClientRect();
  const linkRect = linkRef.current?.getBoundingClientRect();

  if (!tooltipRect || !linkRect) return { top: 0, left: 0 };

  const linkCenterY = linkRect.top + linkRect.height / 2;
  const linkCenterX = linkRect.left + linkRect.width / 2;

  const placements = {
    top: {
      top: linkRect.top - margin - tooltipRect.height,
      left: linkCenterX - tooltipRect.width / 2,
    },
    right: {
      top: linkCenterY - tooltipRect.height / 2,
      left: linkRect.right + margin,
    },
    bottom: {
      top: linkRect.bottom + margin,
      left: linkCenterX - tooltipRect.width / 2,
    },
    left: {
      top: linkCenterY - tooltipRect.height / 2,
      left: linkRect.left - margin - tooltipRect.width,
    },
  };
  return {
    top: placements[placement].top + finalOffset.top,
    left: placements[placement].left + finalOffset.left,
  };
};

// Custom hook for handling clicks outside the tooltip
const useOnOutsideClick = (
  refs: React.RefObject<HTMLElement>[],
  isOpen: boolean,
  onOutsideClick: () => void
) => {
  useLayoutEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && refs.every(ref => ref.current && !ref.current.contains(event.target as Node))) {
        onOutsideClick();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOutsideClick, refs]);
};

export default Tooltip;