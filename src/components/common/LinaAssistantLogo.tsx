import React from 'react';

interface LinaAssistantLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'icon' | 'compact';
}

export const LinaAssistantLogo: React.FC<LinaAssistantLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'full',
}) => {
  // Height scale mappings
  const heightMap = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const iconSizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizeMap[size]} ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="icon-purple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#5B21B6" />
            </linearGradient>
            <linearGradient id="icon-pink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
            <linearGradient id="icon-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <filter id="icon-shadow" x="-10%" y="-10%" width="130%" height="130%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.3" />
            </filter>
          </defs>

          {/* L + Sparkle icon representation */}
          <rect x="15" y="15" width="22" height="65" rx="11" fill="url(#icon-purple)" />
          <rect x="15" y="58" width="55" height="22" rx="11" fill="url(#icon-pink)" />
          <path d="M50 20 L58 35 L75 38 L62 50 L66 68 L50 58 L34 68 L38 50 L25 38 L42 35 Z" fill="url(#icon-cyan)" opacity="0.85" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${heightMap[size]} ${className}`}>
      <svg
        viewBox="0 0 540 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-full max-w-full overflow-visible"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25))' }}
      >
        <defs>
          {/* Color Gradients matching attached design */}
          {/* Deep Violet / Purple */}
          <linearGradient id="lina-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>

          {/* Vibrant Pink / Magenta */}
          <linearGradient id="lina-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="50%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>

          {/* Bright Cyan / Turquoise */}
          <linearGradient id="lina-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Warm Orange */}
          <linearGradient id="lina-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Drop Shadows for Realistic Paper-Fold Overlaps */}
          <filter id="fold-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
          </filter>

          <filter id="subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* LETTER 'L' */}
        {/* ---------------------------------------------------- */}
        {/* L Vertical Stem (Purple) */}
        <rect
          x="30"
          y="30"
          width="36"
          height="110"
          rx="18"
          fill="url(#lina-purple)"
        />
        {/* L Horizontal Base (Pink - Overlapping fold) */}
        <rect
          x="30"
          y="104"
          width="100"
          height="36"
          rx="18"
          fill="url(#lina-pink)"
          filter="url(#fold-shadow)"
        />

        {/* ---------------------------------------------------- */}
        {/* LETTER 'I' */}
        {/* ---------------------------------------------------- */}
        {/* Double Pill Vertical Stem (Pink) */}
        <rect
          x="148"
          y="30"
          width="36"
          height="110"
          rx="18"
          fill="url(#lina-pink)"
          filter="url(#subtle-shadow)"
        />

        {/* ---------------------------------------------------- */}
        {/* LETTER 'N' */}
        {/* ---------------------------------------------------- */}
        {/* N Left Vertical (Pink) */}
        <rect
          x="200"
          y="30"
          width="36"
          height="110"
          rx="18"
          fill="url(#lina-pink)"
        />
        {/* N Right Vertical (Purple - Behind Diagonal) */}
        <rect
          x="298"
          y="30"
          width="36"
          height="110"
          rx="18"
          fill="url(#lina-purple)"
        />
        {/* N Diagonal Ribbon (Cyan - Overlapping Top-Left to Bottom-Right) */}
        <g filter="url(#fold-shadow)">
          <path
            d="M 205 32 L 315 138 C 322 145, 332 141, 333 130 L 333 125 L 222 19 C 215 12, 204 17, 205 28 Z"
            fill="url(#lina-cyan)"
          />
          {/* Diagonal Capsule Cap Start */}
          <circle cx="218" cy="36" r="18" fill="url(#lina-cyan)" />
          {/* Diagonal Capsule Cap End */}
          <circle cx="316" cy="134" r="18" fill="url(#lina-cyan)" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* LETTER 'A' */}
        {/* ---------------------------------------------------- */}
        {/* A Crossbar (Orange - Connected horizontally inside A) */}
        <rect
          x="385"
          y="92"
          width="70"
          height="28"
          rx="14"
          fill="url(#lina-orange)"
        />

        {/* A Left Leg (Purple Slope) */}
        <g filter="url(#fold-shadow)">
          <path
            d="M 430 30 L 350 132 C 345 138, 350 148, 358 148 L 370 148 L 445 42 Z"
            fill="url(#lina-purple)"
          />
          <circle cx="430" cy="36" r="18" fill="url(#lina-purple)" />
          <circle cx="362" cy="132" r="18" fill="url(#lina-purple)" />
        </g>

        {/* A Right Leg (Cyan Slope Overlapping at Top) */}
        <g filter="url(#fold-shadow)">
          <path
            d="M 425 30 L 505 132 C 510 138, 505 148, 497 148 L 485 148 L 410 42 Z"
            fill="url(#lina-cyan)"
          />
          <circle cx="425" cy="36" r="18" fill="url(#lina-cyan)" />
          <circle cx="493" cy="132" r="18" fill="url(#lina-cyan)" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* SUBTITLE & ACCENT LINES: "A S S I S T A N T" */}
        {/* ---------------------------------------------------- */}
        {showSubtitle && (
          <g>
            {/* Left Accent Line (Pink) with Node Dot */}
            <line x1="50" y1="185" x2="115" y2="185" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="115" cy="185" r="4.5" fill="#F43F5E" />

            {/* Subtitle Text */}
            <text
              x="270"
              y="190"
              fill="#E2E8F0"
              fontSize="23"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="11"
              textAnchor="middle"
              className="tracking-widest"
            >
              ASSISTANT
            </text>

            {/* Right Accent Line (Cyan) with Node Dot */}
            <circle cx="425" cy="185" r="4.5" fill="#06B6D4" />
            <line x1="425" y1="185" x2="490" y2="185" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
