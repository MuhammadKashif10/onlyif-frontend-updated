import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface AvatarImageProps {
  src: string;
  alt?: string;
  className?: string;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export function Avatar({ src, alt, fallback, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full bg-gray-100 ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className="font-medium text-gray-600">
          {fallback || '?'}
        </span>
      )}
    </div>
  );
}

export function AvatarImage({ src, alt, className = '' }: AvatarImageProps) {
  return (
    <img
      src={src}
      alt={alt || 'Avatar'}
      className={`w-full h-full rounded-full object-cover ${className}`}
    />
  );
}

export function AvatarFallback({ children, className = '' }: AvatarFallbackProps) {
  return (
    <span className={`font-medium text-gray-600 ${className}`}>
      {children}
    </span>
  );
}

export default Avatar;