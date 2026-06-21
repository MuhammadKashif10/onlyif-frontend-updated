import React from 'react';

interface LogoProps {
  /**
   * Tailwind sizing utilities for this placement (e.g. width classes for the
   * Navbar, height classes for the Admin header). The non-sized axis should use
   * `h-auto` / `w-auto` so the aspect ratio is always preserved (no stretching).
   */
  className?: string;
  alt?: string;
}

/**
 * Single source of truth for the OnlyIf header / admin brand logo.
 *
 * Every header surface (main Navbar + AdminLayout) renders the logo through this
 * component so the asset, alt text and hover treatment stay identical. Only the
 * size utilities are passed in per placement; nothing else should diverge.
 */
export default function Logo({ className = '', alt = 'OnlyIf logo' }: LogoProps) {
  return (
    <img
      src="/images/logo.PNG"
      alt={alt}
      className={`object-contain transition-transform duration-200 group-hover:scale-105 ${className}`}
    />
  );
}
