import React from 'react';

interface RendlyLogoProps {
  className?: string;
}

export function RendlyLogo({ className = 'w-48 h-48' }: RendlyLogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle - space_indigo */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="#3b3355"
        strokeWidth="2"
      />

      {/* Inner circle for depth */}
      <circle
        cx="100"
        cy="100"
        r="85"
        fill="none"
        stroke="#3b3355"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Main R letter - using glaucous (primary blue) */}
      <g fill="#507dbc">
        {/* R vertical line */}
        <rect x="50" y="50" width="12" height="100" rx="2" />

        {/* R top curve */}
        <path d="M 62 50 Q 85 50 85 70 Q 85 85 70 88 L 62 88 Z" fill="#507dbc" />

        {/* R diagonal leg */}
        <path
          d="M 70 88 Q 85 90 95 110 L 85 145 Q 83 148 80 145 L 72 105 Q 65 95 60 92 Z"
          fill="#507dbc"
        />
      </g>

      {/* Accent dot - cyan accent */}
      <circle cx="145" cy="60" r="4" fill="#35ffff" />

      {/* Rendly text */}
      <text
        x="100"
        y="165"
        fontSize="24"
        fontWeight="700"
        textAnchor="middle"
        fill="#04080f"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="2"
      >
        RENDLY
      </text>

      {/* Tagline: Know Your Why, Find Your Who */}
      <text
        x="100"
        y="178"
        fontSize="7"
        textAnchor="middle"
        fill="#507dbc"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="0.5"
        opacity="0.8"
      >
        Know Your Why,
      </text>
      <text
        x="100"
        y="186"
        fontSize="7"
        textAnchor="middle"
        fill="#507dbc"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="0.5"
        opacity="0.8"
      >
        Find Your Who
      </text>
    </svg>
  );
}

export default RendlyLogo;
