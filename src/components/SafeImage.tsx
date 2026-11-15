import React, { useState } from 'react';
import { Shirt } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className = '', fallbackLabel }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100 text-blue-900/70 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Shirt className="h-8 w-8 mb-2 stroke-[1.5]" />
        {fallbackLabel ? (
          <span className="text-xs font-medium text-slate-600 px-3 text-center">{fallbackLabel}</span>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
