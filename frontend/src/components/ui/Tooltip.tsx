import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

const Tooltip = ({ content, children, className = '' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`relative flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
                        bg-surface-elevated text-text-primary text-xs rounded shadow-lg 
                        border border-border-default whitespace-nowrap z-[100] pointer-events-none">
          {content}
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 
                          border-transparent border-t-border-default" />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
