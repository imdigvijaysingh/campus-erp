import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  to,
  href,
  onClick, 
  type = 'button', 
  disabled = false,
  ...rest
}) => {
  const baseClasses = "inline-block px-[30px] py-[12px] border-none rounded-4xl text-[1rem] font-semibold cursor-pointer transition-all duration-300 no-underline text-center";
  
  const variants = {
    primary: "bg-[#6D4C9C] text-white shadow-[0_2px_10px_rgba(254,11,0,0.33)] hover:bg-[#d40900] hover:text-white hover:-translate-y-[3px] hover:shadow-[0_10px_20px_rgba(193,40,40,0.1)]",
    outline: "bg-transparent border-[2px] border-[var(--color-primary)] text-[var(--color-primary)] shadow-none bg-none hover:bg-[var(--color-primary)] hover:text-white",
  };

  const combinedClasses = `${baseClasses} ${variants[variant] || variants.primary} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button 
      type={type} 
      className={combinedClasses} 
      onClick={onClick} 
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
