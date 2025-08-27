import React, { forwardRef, useRef, useEffect } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  ariaControls?: string;
  ariaHaspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      ariaLabel,
      ariaDescribedBy,
      ariaExpanded,
      ariaPressed,
      ariaControls,
      ariaHaspopup,
      onKeyDown,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { setAriaLabel, setAriaDescribedBy, setAriaExpanded, setAriaPressed } = useAccessibility();

    // Forward ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(buttonRef.current);
        } else {
          ref.current = buttonRef.current;
        }
      }
    }, [ref]);

    // Set ARIA attributes
    useEffect(() => {
      if (!buttonRef.current) return;

      if (ariaLabel) {
        setAriaLabel(buttonRef.current, ariaLabel);
      }
      if (ariaDescribedBy) {
        setAriaDescribedBy(buttonRef.current, ariaDescribedBy);
      }
      if (ariaExpanded !== undefined) {
        setAriaExpanded(buttonRef.current, ariaExpanded);
      }
      if (ariaPressed !== undefined) {
        setAriaPressed(buttonRef.current, ariaPressed);
      }
    }, [ariaLabel, ariaDescribedBy, ariaExpanded, ariaPressed, setAriaLabel, setAriaDescribedBy, setAriaExpanded, setAriaPressed]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Handle Enter and Space key presses
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!disabled && !loading) {
          buttonRef.current?.click();
        }
      }

      // Call custom onKeyDown handler
      onKeyDown?.(event);
    };

    const getVariantClasses = () => {
      const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
      
      const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
      };

      const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      };

      return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
    };

    const renderIcon = () => {
      if (!icon) return null;

      const iconClasses = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
      const iconSpacing = size === 'sm' ? 'mr-1.5' : size === 'lg' ? 'mr-3' : 'mr-2';

      return (
        <span className={`${iconClasses} ${iconPosition === 'left' ? iconSpacing : 'ml-2'}`}>
          {icon}
        </span>
      );
    };

    const renderLoadingSpinner = () => {
      if (!loading) return null;

      const spinnerClasses = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
      const spinnerSpacing = size === 'sm' ? 'mr-1.5' : size === 'lg' ? 'mr-3' : 'mr-2';

      return (
        <svg
          className={`${spinnerClasses} ${spinnerSpacing} animate-spin`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    };

    return (
      <button
        ref={buttonRef}
        className={`${getVariantClasses()} ${className}`}
        disabled={disabled || loading}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        {...props}
      >
        {loading ? (
          <>
            {renderLoadingSpinner()}
            <span>Loading...</span>
          </>
        ) : (
          <>
            {iconPosition === 'left' && (icon || renderIcon())}
            <span>{children}</span>
            {iconPosition === 'right' && icon}
          </>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
