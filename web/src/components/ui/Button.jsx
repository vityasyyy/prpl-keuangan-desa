"use client";

import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[--radius-button] font-medium transition-colors focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

const variants = {
  brand: "bg-[--brand] text-white hover:[filter:brightness(0.95)]",
  accent: "bg-[--accent] text-white hover:[filter:brightness(0.95)]",
  ghost: "bg-transparent text-[--text] hover:bg-[--surface-2] border border-[--border]",
  danger: "bg-[--danger] text-white hover:[filter:brightness(0.95)]",
  secondary: "bg-[--surface-2] text-[--text] hover:bg-[--surface] border border-[--border]",
};

export default function Button({
  as = "button",
  href,
  type = "button",
  variant = "brand",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const cls = [base, sizes[size], variants[variant], className]
    .filter(Boolean)
    .join(" ");

  if (as === "a" && href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}
