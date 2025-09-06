'use client';

import { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, ChevronDown } from 'lucide-react';

interface InputFieldProps {
  variant?: 'text' | 'textarea' | 'select' | 'locationPicker';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: { value: string; label: string }[];
  className?: string;
  error?: string;
}

export const InputField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  InputFieldProps
>(
  (
    {
      variant = 'text',
      label,
      placeholder,
      value,
      onChange,
      options,
      className,
      error,
      ...props
    },
    ref
  ) => {
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    const baseClasses =
      'w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200';

    const handleLocationClick = async () => {
      if (variant !== 'locationPicker') return;

      setIsLocationLoading(true);
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        const { latitude, longitude } = position.coords;
        onChange?.(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      } catch (error) {
        console.error('Failed to get location:', error);
        onChange?.('Location unavailable');
      } finally {
        setIsLocationLoading(false);
      }
    };

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-200">
            {label}
          </label>
        )}

        {variant === 'textarea' && (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={cn(baseClasses, 'min-h-24 resize-none')}
            {...props}
          />
        )}

        {variant === 'select' && (
          <div className="relative">
            <select
              ref={ref as React.Ref<HTMLSelectElement>}
              value={value}
              onChange={e => onChange?.(e.target.value)}
              className={cn(baseClasses, 'appearance-none pr-10')}
              {...props}
            >
              <option value="" disabled>
                {placeholder || 'Select an option'}
              </option>
              {options?.map(option => (
                <option
                  key={option.value}
                  value={option.value}
                  className="text-gray-900"
                >
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
          </div>
        )}

        {variant === 'locationPicker' && (
          <div className="relative">
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type="text"
              value={value}
              onChange={e => onChange?.(e.target.value)}
              placeholder={placeholder || 'Enter location or use GPS'}
              className={cn(baseClasses, 'pr-12')}
              {...props}
            />
            <button
              type="button"
              onClick={handleLocationClick}
              disabled={isLocationLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-300 hover:text-white transition-colors duration-200 disabled:opacity-50"
            >
              <MapPin
                className={cn('w-5 h-5', isLocationLoading && 'animate-pulse')}
              />
            </button>
          </div>
        )}

        {variant === 'text' && (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="text"
            value={value}
            onChange={e => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={baseClasses}
            {...props}
          />
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
