import React from 'react';

interface CredBridgeLogoProps {
  className?: string;
  showTagline?: boolean;
  taglineText?: string;
  portalBadge?: string;
  variant?: 'full' | 'icon-only' | 'header';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const CredBridgeLogo: React.FC<CredBridgeLogoProps> = ({
  className = '',
  showTagline = false,
  taglineText = 'The Reliable Bridge to Specialized Gigs',
  portalBadge,
  variant = 'header',
  size = 'md',
  onClick
}) => {
  const iconHeight = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-12' : 'h-9';

  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-3 select-none cursor-pointer ${className}`}
    >
      <img
        src="/credbridge-logo.png"
        alt="CredBridge Logo"
        className={`${iconHeight} w-auto object-contain shrink-0`}
      />
      {variant !== 'icon-only' && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-black text-lg text-[#18181B] tracking-tight leading-none">
              CredBridge
            </span>
            {portalBadge && (
              <span className="inline-block text-[9px] text-[#FF6600] font-extrabold uppercase tracking-wider bg-[#FFF0E6] px-2 py-0.5 rounded-full border border-[#FF6600]/20">
                {portalBadge}
              </span>
            )}
          </div>
          {showTagline && (
            <span className="text-[10px] text-[#71717A] font-medium tracking-tight mt-0.5">
              {taglineText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
