import React from 'react';

interface IslamicPatternProps {
  className?: string;
  opacity?: number;
}

export const IslamicPattern: React.FC<IslamicPatternProps> = ({ className = '', opacity = 0.04 }) => {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <pattern id="islamic-geom-pat" width="40" height="40" patternUnits="userSpaceOnUse">
          {/* 8-pointed star & geometric interlace */}
          <path
            d="M20 0 L25 15 L40 20 L25 25 L20 40 L15 25 L0 20 L15 15 Z"
            stroke="currentColor"
            strokeWidth="0.75"
            fill="none"
          />
          <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <path
            d="M0 0 L10 10 M40 0 L30 10 M40 40 L30 30 M0 40 L10 30"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1 1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-geom-pat)" />
    </svg>
  );
};
