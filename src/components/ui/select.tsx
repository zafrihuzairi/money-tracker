import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'glass h-11 w-full rounded-2xl border border-black/10 px-4 text-sm text-ink-900 outline-none transition-all duration-200',
        'focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15',
        className
      )}
      {...props}
    />
  )
);
Select.displayName = 'Select';
