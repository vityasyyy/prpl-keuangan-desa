"use client";

export default function Button({
  children,
  variant = "primary",
  onClick,
  icon,
  className = "",
  title,
  ...props
}) {
  const baseClasses =
    'flex px-[14px] py-2 justify-center items-center gap-2 rounded-lg border shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] font-["Inter"] text-sm font-medium leading-5 cursor-pointer transition transform will-change-auto';

  const variantClasses = {
    primary:
      "border-[#0479ce] bg-[#0479ce] text-white hover:brightness-95 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#0479ce]/40",
    orange:
      "border-[#ff9500] bg-[#ff9500] text-white hover:brightness-95 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#ff9500]/40",
    green:
      "border-[#099250] bg-[#099250] text-white hover:brightness-95 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#099250]/40",
    danger:
      "border-[#dc2626] bg-[#dc2626] text-white hover:brightness-95 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/40",
    outline:
      "border-[#4b5565] bg-transparent text-[#364152] hover:bg-black/5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#4b5565]/20",
  };

  return (
    <button
      aria-label={title}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
      {icon && <span className="inline-flex items-center">{icon}</span>}
    </button>
  );
}
