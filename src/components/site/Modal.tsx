'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/lib/use-focus-trap';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  /** Classes for the panel; the backdrop is shared. */
  className?: string;
  zIndex?: string;
}

/**
 * Portals its children to <body>. Sections use `isolate`/transforms for their
 * effects, which would otherwise trap a fixed pop-up inside the section so
 * later sections paint over it.
 */
export function BodyPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

/** Backdrop + panel with Escape to close, focus trap, and page scroll lock. */
export function Modal({ open, onClose, label, children, className = '', zIndex = 'z-[90]' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <BodyPortal>
    <div
      onClick={onClose}
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-[rgba(20,30,40,0.7)] p-[clamp(12px,3vw,40px)]`}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-full w-full max-w-[1100px] rounded-2xl bg-paper shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${className}`}
      >
        {children}
      </div>
    </div>
    </BodyPortal>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="h-10 w-10 flex-none cursor-pointer rounded-full border border-line bg-white text-lg text-ink hover:bg-mist"
    >
      ✕
    </button>
  );
}
