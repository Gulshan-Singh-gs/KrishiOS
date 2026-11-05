import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Link000: Standard High-Contrast Interactive Link
 */
export const Link000: React.FC<LinkProps> = ({ children, className = '', ...props }) => (
  <a
    {...props}
    className={`inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors duration-200 cursor-pointer ${className}`}
  >
    {children}
  </a>
);

/**
 * Link001: Left-to-Right Underline Reveal
 */
export const Link001: React.FC<LinkProps> = ({ children, className = '', ...props }) => (
  <a
    {...props}
    className={`relative inline-flex items-center group cursor-pointer text-emerald-400 font-medium ${className}`}
  >
    <span>{children}</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-300 ease-out group-hover:w-full" />
  </a>
);

/**
 * Link002: Right-to-Left Underline Transition
 */
export const Link002: React.FC<LinkProps> = ({ children, className = '', ...props }) => (
  <a
    {...props}
    className={`relative inline-flex items-center group cursor-pointer text-neutral-300 hover:text-white font-medium ${className}`}
  >
    <span>{children}</span>
    <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0" />
  </a>
);

/**
 * Link003: Center Expansion Underline
 */
export const Link003: React.FC<LinkProps> = ({ children, className = '', ...props }) => (
  <a
    {...props}
    className={`relative inline-flex items-center group cursor-pointer text-neutral-300 hover:text-emerald-400 font-medium transition-colors ${className}`}
  >
    <span>{children}</span>
    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-emerald-400 transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-full" />
  </a>
);

/**
 * Link004: Height Reveal / Background Highlight Lift
 */
export const Link004: React.FC<LinkProps> = ({ children, className = '', ...props }) => (
  <a
    {...props}
    className={`relative inline-flex items-center px-2 py-0.5 rounded group cursor-pointer text-neutral-200 hover:text-white font-medium overflow-hidden ${className}`}
  >
    <span className="absolute inset-0 bg-emerald-950/80 -translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out -z-10 rounded" />
    <span className="relative z-10">{children}</span>
  </a>
);

/**
 * Link005: Arrow Micro-Shift & Width Reveal
 */
export const Link005: React.FC<LinkProps> = ({ children, className = '', ...props }) => (
  <a
    {...props}
    className={`inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium group cursor-pointer transition-colors ${className}`}
  >
    <span>{children}</span>
    <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1">
      →
    </span>
  </a>
);

