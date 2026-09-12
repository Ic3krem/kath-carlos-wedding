'use client';

import { useEffect } from 'react';

interface StoryModalProps {
  open: boolean;
  title: string;
  fullStory: string;
  onClose: () => void;
}

export function StoryModal({ open, title, fullStory, onClose }: StoryModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="dialog" aria-modal="true">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-lg bg-secondary p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-3xl text-primary sm:text-4xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none">
            &times;
          </button>
        </div>
        <p className="whitespace-pre-line text-black/70">{fullStory}</p>
      </div>
    </div>
  );
}
