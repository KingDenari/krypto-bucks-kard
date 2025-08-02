
import React from 'react';

interface KryptoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const KryptoLogo: React.FC<KryptoLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-lg',
    md: 'w-8 h-8 text-xl', 
    lg: 'w-12 h-12 text-3xl',
    xl: 'w-16 h-16 text-4xl'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center font-bold`}>
      <span className="bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
        K<span className="text-sm relative -top-1 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">b</span>
      </span>
    </div>
  );
};

export default KryptoLogo;
