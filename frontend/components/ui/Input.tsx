// Composant Input réutilisable
import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  helper,
  fullWidth = false,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = clsx(
    `
      px-4 py-3 border rounded-lg text-base font-medium text-gray-900 bg-white
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition-colors placeholder:text-gray-500
      disabled:bg-gray-50 disabled:cursor-not-allowed
    `,
    error 
      ? 'border-red-300 focus:ring-red-500' 
      : 'border-gray-300 hover:border-gray-400',
    fullWidth && 'w-full',
    className
  );

  return (
    <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
