import Image from 'next/image';

interface LogoProps {
  /**
   * Tailwind sizing utilities for this placement (e.g. width classes for the
   * Navbar, height classes for the Admin header). Keep the non-sized axis as
   * `h-auto` / `w-auto` so the aspect ratio is always preserved (no stretching).
   */
  className?: string;
  alt?: string;
  /** Header logos are above the fold, so eager-load by default (no fade-in). */
  priority?: boolean;
}

/**
 * Single source of truth for the OnlyIf header / admin brand logo.
 *
 * Rendered via next/image so every header surface gets an optimized, retina-aware
 * (srcset) copy of the one canonical asset — crisper on high-DPI screens and a
 * smaller payload than a raw <img>, with the intrinsic 1536x1024 dimensions set
 * to prevent layout shift. Only size utilities differ per placement.
 */
export default function Logo({
  className = '',
  alt = 'OnlyIf logo',
  priority = true,
}: LogoProps) {
  return (
    <Image
      src="/images/logo.PNG"
      alt={alt}
      width={1536}
      height={1024}
      priority={priority}
      sizes="(min-width: 1024px) 208px, (min-width: 640px) 192px, 176px"
      className={`object-contain transition-transform duration-200 group-hover:scale-105 ${className}`}
    />
  );
}
