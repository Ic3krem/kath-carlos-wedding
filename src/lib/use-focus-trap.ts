'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared focus-management hook for modal/overlay dialogs.
 *
 * While `active` is true:
 * - moves focus into the panel (first focusable element, or the panel itself)
 * - traps Tab/Shift+Tab so focus cycles within the panel
 * - restores focus to whatever was focused before the panel opened, once it closes
 *
 * Usage: attach `panelRef` to the dialog's outermost focusable container.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean, panelRef: React.RefObject<T>) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusFirst = () => {
      const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      } else {
        panel?.focus();
      }
    };
    focusFirst();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (current === first || !panel.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (current === last || !panel.contains(current)) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [active, panelRef]);
}
