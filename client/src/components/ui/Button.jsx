import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ className, variant = 'primary', size = 'md', children, ...props }) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-primary-500/20',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={twMerge(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
