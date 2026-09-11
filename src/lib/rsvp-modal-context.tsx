'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface RsvpModalState {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const RsvpModalContext = createContext<RsvpModalState | null>(null);

export function RsvpModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({ open, openModal: () => setOpen(true), closeModal: () => setOpen(false) }),
    [open]
  );
  return <RsvpModalContext.Provider value={value}>{children}</RsvpModalContext.Provider>;
}

export function useRsvpModal(): RsvpModalState {
  const context = useContext(RsvpModalContext);
  if (!context) {
    throw new Error('useRsvpModal must be used within an RsvpModalProvider');
  }
  return context;
}
