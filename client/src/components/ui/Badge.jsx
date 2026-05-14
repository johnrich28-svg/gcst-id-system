import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Badge = ({ className, variant = 'neutral', children, ...props }) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700',
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
