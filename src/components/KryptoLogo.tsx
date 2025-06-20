
import React from 'react';

interface KryptoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const KryptoLogo: React.FC<KryptoLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="krypto-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        
        {/* K$ Symbol */}
        <g fill="url(#krypto-gradient)">
          {/* Dollar sign circle */}
          <circle cx="50" cy="50" r="45" stroke="url(#krypto-gradient)" strokeWidth="3" fill="none"/>
          
          {/* K letter */}
          <path d="M25 25 L25 75 M25 50 L45 30 M25 50 L45 70" stroke="url(#krypto-gradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          
          {/* Dollar sign */}
          <path d="M65 35 Q55 30 55 40 Q55 45 65 45 Q75 45 75 55 Q75 65 65 65" stroke="url(#krypto-gradient)" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <line x1="60" y1="30" x2="60" y2="70" stroke="url(#krypto-gradient)" strokeWidth="2"/>
          <line x1="70" y1="30" x2="70" y2="70" stroke="url(#krypto-gradient)" strokeWidth="2"/>
        </g>
      </svg>
    </div>
  );
};

export default KryptoLogo;
