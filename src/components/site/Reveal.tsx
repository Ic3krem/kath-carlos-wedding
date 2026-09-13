'use client';

import { useEffect, useRef, useState } from 'react';

type RevealFrom = 'up' | 'down' | 'left' | 'right' | 'scale';
type RevealTag = 'div' | 'section' | 'li' | 'tr' | 'td' | 'p' | 'h2' | 'h3';

const HIDDEN: Record<RevealFrom, string> = {
  up: 'translate-y-8 opacity-0',
  down: '-translate-y-8 opacity-0',
  left: '-translate-x-10 opacity-0',
  right: 'translate-x-10 opacity-0',
  scale: 'scale-95 opacity-0',
};

const SHOWN = 'translate-x-0 translate-y-0 scale-100 opacity-100';

interface RevealProps {
  children: React.ReactNode;
  /** Direction the element travels in from. */
  from?: RevealFrom;
  /** Stagger, in ms, for elements revealed as a group. */
  delay?: number;
  className?: string;
  as?: RevealTag;
  /** How much of the element must be visible before it reveals. */
  threshold?: number;
}

/**
 * Fades content in as it scrolls into view, once. `prefers-reduced-motion` is
 * handled globally (globals.css collapses every transition duration), so the
 * content still appears — it just arrives instantly instead of sliding.
 *
 * The hidden state ships in the SSR markup, so a browser with scripting
 * disabled would never see the content; globals.css restores it under
 * `@media (scripting: none)`.
 */
export function Reveal({
  children,
  from = 'up',
  delay = 0,
  className = '',
  as: Tag = 'div',
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      // The tag union is narrower than the ref type React infers per element.
      ref={ref as React.Ref<never>}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-[transform,opacity] duration-700 ease-out will-change-[transform,opacity] motion-reduce:transition-none ${
        shown ? SHOWN : HIDDEN[from]
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
