"use client";

import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left' | 
              'top-start' | 'top-end' | 
              'right-start' | 'right' | 'right-end' | 
              'bottom-start' | 'bottom' | 'bottom-end' | 
              'left-start' | 'left' | 'left-end';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  offset?: number;
}

export function Tooltip({ 
  content, 
  children, 
  placement = 'right', 
  color = 'default',
  offset = 7
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Define color styles
  const colorStyles = {
    default: {
      bg: '#18191c',
      text: 'white',
    },
    primary: {
      bg: '#0070f3',
      text: 'white',
    },
    secondary: {
      bg: '#7828c8',
      text: 'white',
    },
    success: {
      bg: '#17c964',
      text: 'white',
    },
    warning: {
      bg: '#f5a524',
      text: 'white',
    },
    danger: {
      bg: '#f31260',
      text: 'white',
    },
  };

  // Calculate position based on placement
  const getTooltipStyles = () => {
    const colorStyle = colorStyles[color];
    const baseStyles = {
      position: 'absolute',
      backgroundColor: colorStyle.bg,
      color: colorStyle.text,
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      transition: 'opacity 0.15s ease, visibility 0.15s ease',
    };

    // Placement calculations
    switch (placement) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: `translateX(-50%) translateY(-${offset}px)`,
        };
      case 'top-start':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '0',
          transform: `translateY(-${offset}px)`,
        };
      case 'top-end':
        return {
          ...baseStyles,
          bottom: '100%',
          right: '0',
          transform: `translateY(-${offset}px)`,
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: `translateX(-50%) translateY(${offset}px)`,
        };
      case 'bottom-start':
        return {
          ...baseStyles,
          top: '100%',
          left: '0',
          transform: `translateY(${offset}px)`,
        };
      case 'bottom-end':
        return {
          ...baseStyles,
          top: '100%',
          right: '0',
          transform: `translateY(${offset}px)`,
        };
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: `translateY(-50%) translateX(-${offset}px)`,
        };
      case 'left-start':
        return {
          ...baseStyles,
          right: '100%',
          top: '0',
          transform: `translateX(-${offset}px)`,
        };
      case 'left-end':
        return {
          ...baseStyles,
          right: '100%',
          bottom: '0',
          transform: `translateX(-${offset}px)`,
        };
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: `translateY(-50%) translateX(${offset}px)`,
        };
      case 'right-start':
        return {
          ...baseStyles,
          left: '100%',
          top: '0',
          transform: `translateX(${offset}px)`,
        };
      case 'right-end':
        return {
          ...baseStyles,
          left: '100%',
          bottom: '0',
          transform: `translateX(${offset}px)`,
        };
      default:
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: `translateY(-50%) translateX(${offset}px)`,
        };
    }
  };

  // Calculate arrow styles based on placement
  const getArrowStyles = () => {
    const colorStyle = colorStyles[color];
    const baseStyles = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
      pointerEvents: 'none',
    };

    // Arrow placement calculations
    if (placement.startsWith('top')) {
      return {
        ...baseStyles,
        bottom: '-6px',
        left: placement === 'top' ? '50%' : placement === 'top-start' ? '10px' : 'auto',
        right: placement === 'top-end' ? '10px' : 'auto',
        marginLeft: placement === 'top' ? '-6px' : '0',
        borderWidth: '6px 6px 0 6px',
        borderColor: `${colorStyle.bg} transparent transparent transparent`,
      };
    } else if (placement.startsWith('bottom')) {
      return {
        ...baseStyles,
        top: '-6px',
        left: placement === 'bottom' ? '50%' : placement === 'bottom-start' ? '10px' : 'auto',
        right: placement === 'bottom-end' ? '10px' : 'auto',
        marginLeft: placement === 'bottom' ? '-6px' : '0',
        borderWidth: '0 6px 6px 6px',
        borderColor: `transparent transparent ${colorStyle.bg} transparent`,
      };
    } else if (placement.startsWith('left')) {
      return {
        ...baseStyles,
        right: '-6px',
        top: placement === 'left' ? '50%' : placement === 'left-start' ? '10px' : 'auto',
        bottom: placement === 'left-end' ? '10px' : 'auto',
        marginTop: placement === 'left' ? '-6px' : '0',
        borderWidth: '6px 0 6px 6px',
        borderColor: `transparent transparent transparent ${colorStyle.bg}`,
      };
    } else { // right placements
      return {
        ...baseStyles,
        left: '-6px',
        top: placement === 'right' ? '50%' : placement === 'right-start' ? '10px' : 'auto',
        bottom: placement === 'right-end' ? '10px' : 'auto',
        marginTop: placement === 'right' ? '-6px' : '0',
        borderWidth: '6px 6px 6px 0',
        borderColor: `transparent ${colorStyle.bg} transparent transparent`,
      };
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      <div style={getTooltipStyles() as React.CSSProperties}>
        {content}
        <div style={getArrowStyles() as React.CSSProperties} />
      </div>
    </div>
  );
}
