'use client';

export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  icon,
  className = '',
  ...props 
}) {
  const baseClasses = 'flex px-[14px] py-2 justify-center items-center gap-2 rounded-lg border shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] font-["Inter"] text-sm font-medium leading-5 cursor-pointer';
  
  const variantClasses = {
    primary: 'border-[#0479ce] bg-[#0479ce] text-white',
    orange: 'border-[#ff9500] bg-[#ff9500] text-white',
    green: 'border-[#099250] bg-[#099250] text-white',
    danger: 'border-[#dc2626] bg-[#dc2626] text-white',
    outline: 'border-[#4b5565] bg-transparent text-[#364152]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
      {icon && icon}
    </button>
  );
}
