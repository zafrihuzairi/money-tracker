import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

/**
 * Liquid-glass card: translucent white, backdrop blur, soft border + shadow,
 * large radius (28px) per the iOS 26 inspired design system.
 * Business logic is never read/written here — presentation only.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'glass rounded-[28px] border border-white/60 shadow-soft',
        'ring-1 ring-black/[0.03] transition-shadow duration-300',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-5 sm:px-6 sm:pt-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold tracking-tight text-ink-900 sm:text-lg', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5 sm:px-6 sm:pb-6', className)} {...props} />;
}
