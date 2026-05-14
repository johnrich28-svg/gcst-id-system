import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = ({ className, label, error, ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}
      <input
        className={twMerge(
          'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all',
          'placeholder:text-slate-400',
          'focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10',
          'disabled:bg-slate-50 disabled:text-slate-500',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
