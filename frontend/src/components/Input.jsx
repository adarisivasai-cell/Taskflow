import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      id,
      name,
      as = 'input',
      rows = 3,
      children,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || Math.random().toString(36).substring(2, 9);

    const baseInputStyles =
      'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500';

    const borderStyles = error
      ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500 dark:border-rose-500'
      : 'border-slate-300 dark:border-slate-700';

    const paddingWithIcon = Icon ? 'pl-10' : '';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}

          {as === 'textarea' ? (
            <textarea
              id={inputId}
              name={name}
              ref={ref}
              rows={rows}
              className={`${baseInputStyles} ${borderStyles} ${paddingWithIcon} ${className}`}
              {...props}
            />
          ) : as === 'select' ? (
            <select
              id={inputId}
              name={name}
              ref={ref}
              className={`${baseInputStyles} ${borderStyles} ${paddingWithIcon} cursor-pointer ${className}`}
              {...props}
            >
              {children}
            </select>
          ) : (
            <input
              id={inputId}
              name={name}
              ref={ref}
              type={type}
              className={`${baseInputStyles} ${borderStyles} ${paddingWithIcon} ${className}`}
              {...props}
            />
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
