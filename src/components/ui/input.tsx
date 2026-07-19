import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'glass h-11 w-full rounded-2xl border border-black/10 px-4 text-sm text-ink-900 outline-none transition-all duration-200',
        'placeholder:text-black/30',
        'focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
