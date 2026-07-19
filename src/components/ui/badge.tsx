import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-gold-100/80 px-2.5 py-1 text-xs font-medium text-gold-700 ring-1 ring-gold-200/60',
        className
      )}
      {...props}
    />
  );
}
