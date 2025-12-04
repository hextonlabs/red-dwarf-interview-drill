import React from 'react';

interface QuizButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

const QuizButton: React.FC<QuizButtonProps> = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  let baseStyles = "relative px-8 py-3 font-bold uppercase tracking-wider transition-all duration-150 transform active:scale-95 border-b-4 border-r-4 rounded text-lg ";
  
  if (variant === 'primary') {
    baseStyles += "bg-red-700 hover:bg-red-600 text-white border-red-900 shadow-[0_0_10px_rgba(220,38,38,0.4)]";
  } else if (variant === 'secondary') {
    baseStyles += "bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-950";
  } else if (variant === 'danger') {
    baseStyles += "bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-800";
  }

  if (disabled) {
    baseStyles += " opacity-50 cursor-not-allowed pointer-events-none filter grayscale";
  }

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${className}`}>
      {children}
      {/* Decorative corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/30" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-black/30" />
    </button>
  );
};

export default QuizButton;
