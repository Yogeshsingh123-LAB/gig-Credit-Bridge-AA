import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  errorMessage,
  icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg bg-slate-900 border ${
            errorMessage ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
          } ${icon ? 'pl-10' : 'px-3.5'} py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition disabled:opacity-50 disabled:bg-slate-950 ${className}`}
          {...props}
        />
      </div>
      {errorMessage ? (
        <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
