import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  useImageOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  useImageOnly = false,
}) => {
  const sizeClasses = {
    sm: { img: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { img: 'w-9 h-9', text: 'text-xl', sub: 'text-[10px]' },
    lg: { img: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon combining P + Shopping Bag with Indian saffron and royal indigo accent */}
      <div className={`relative ${sizeClasses.img} shrink-0 overflow-hidden rounded-lg shadow-sm border border-amber-200/60 bg-white flex items-center justify-center`}>
        <img
          src="/src/assets/images/paigammart_logo_1791034633661.jpg"
          alt="PaigamMart"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Elegant SVG fallback if image is not loaded
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-amber-500 via-orange-600 to-indigo-900 flex items-center justify-center text-white font-bold">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
              `;
            }
          }}
        />
      </div>

      {!useImageOnly && (
        <div className="flex flex-col">
          <div className="flex items-baseline leading-none">
            <span className={`font-black tracking-tight text-slate-900 ${sizeClasses.text}`}>
              Paigam<span className="text-amber-600">Mart</span>
            </span>
          </div>
          {showTagline && (
            <span className={`text-slate-500 font-medium tracking-wider uppercase mt-0.5 ${sizeClasses.sub}`}>
              Bharat Ka Marketplace
            </span>
          )}
        </div>
      )}
    </div>
  );
};
