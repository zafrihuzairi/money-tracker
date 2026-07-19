import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef } from 'react';

/**
 * Glass button system: gold-gradient primary, frosted-white secondary,
 * soft-red danger. Every size meets the 44px minimum touch target.
 * motion-reduce: disables the transform/scale so reduced-motion users
 * don't get the lift/press animation.
 */
const buttonVariants = cva(
  'inline-flex min-h-touch items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 ' +
    'active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-40 disabled:pointer-events-none ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-gold-400 to-gold-600 text-white shadow-[0_8px_20px_rgba(198,144,47,0.35)] hover:shadow-[0_10px_26px_rgba(198,144,47,0.45)] hover:brightness-105',
        gold:
          'bg-gradient-to-b from-gold-400 to-gold-600 text-white shadow-[0_8px_20px_rgba(198,144,47,0.35)] hover:shadow-[0_10px_26px_rgba(198,144,47,0.45)] hover:brightness-105',
        outline:
          'glass border border-black/10 text-ink-900 hover:bg-white/90',
        ghost: 'text-ink-900 hover:bg-black/5',
        destructive:
          'bg-red-500/90 text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:bg-red-500'
      },
      size: {
        default: 'h-11 px-5 text-sm',
        sm: 'h-10 px-4 text-xs',
        lg: 'h-12 px-6 text-base'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
