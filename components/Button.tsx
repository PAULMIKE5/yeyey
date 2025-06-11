
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gradient';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, icon, className, ...props }) => {
  let baseStyle = "font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95 flex items-center justify-center space-x-2";

  if (variant === 'gradient') {
    baseStyle += " bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white focus:ring-purple-500";
  } else if (variant === 'secondary') {
    baseStyle += " bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500";
  } else { // primary
    baseStyle += " bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400";
  }

  return (
    <button className={`${baseStyle} ${className}`} {...props}>
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
