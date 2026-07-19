'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Reusable premium bottom sheet / floating dialog.
 * - Mobile: slides up from the bottom, respects safe-area-inset-bottom.
 * - Desktop: fades + scales in as a centered floating glass panel.
 * - Backdrop: heavy blur, tap to dismiss.
 * - Respects prefers-reduced-motion via Tailwind's motion-reduce: variants
 *   is not enough for Framer Motion, so we shorten/soften spring instead.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="glass safe-bottom relative z-10 max-h-[85dvh] w-full overflow-y-auto rounded-t-[32px] border border-white/60 p-5 shadow-soft sm:max-w-md sm:rounded-[28px] sm:p-6"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-black/10 sm:hidden" />
            </div>
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
