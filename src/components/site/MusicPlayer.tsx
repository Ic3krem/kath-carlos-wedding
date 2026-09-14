'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Played in this order, then back to the first. The files are held in Vercel
 * Blob rather than /public so the ~24 MB of audio stays out of the repo and
 * off every deployment; re-upload over the same paths to swap a track.
 */
const BLOB_BASE = 'https://lxzzcx7ubyxrkqsz.public.blob.vercel-storage.com/music';
const PLAYLIST = [1, 2, 3, 4].map((track) => `${BLOB_BASE}/${track}.mp3`);

const VOLUME = 0.7;
const STORAGE_KEY = 'wedding-music-off';

/**
 * Background music for the page.
 *
 * Browsers refuse audio that starts without a gesture, so the first play()
 * attempt is expected to fail; when it does, the next tap, click, key or
 * scroll anywhere on the page starts it instead. A guest who turns it off has
 * that remembered, and is never started again on a later visit until they turn
 * it back on.
 */
export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Rendered only after mount: the button's state depends on localStorage and
  // on whether audio actually started, neither of which the server knows.
  const [ready, setReady] = useState(false);

  const optedOut = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    setReady(true);
    const audio = audioRef.current;
    if (!audio || optedOut()) return;

    audio.volume = VOLUME;

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      audio.play().then(
        () => {
          if (!cancelled) setPlaying(true);
          detach();
        },
        () => {
          /* Still waiting on a gesture — the listeners below cover it. */
        }
      );
    };

    // Every gesture a browser is willing to count, so the music starts on
    // whatever the guest happens to do first.
    const events = [
      'pointerdown',
      'pointerup',
      'click',
      'keydown',
      'touchstart',
      'touchend',
      'wheel',
      'scroll',
    ] as const;
    function detach() {
      events.forEach((event) => window.removeEventListener(event, start));
    }

    start();
    events.forEach((event) => window.addEventListener(event, start, { passive: true }));

    return () => {
      cancelled = true;
      detach();
    };
  }, [optedOut]);

  // Changing the track swaps the src, which stops playback, so start the new
  // one — but not on the very first render, when nothing is playing yet.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing) return;
    audio.volume = VOLUME;
    void audio.play().catch(() => setPlaying(false));
  }, [track, playing]);

  function handleEnded() {
    setTrack((current) => (current + 1) % PLAYLIST.length);
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* Private browsing — the choice just does not outlive the visit. */
      }
      return;
    }
    audio.volume = VOLUME;
    void audio.play().then(
      () => {
        setPlaying(true);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* As above. */
        }
      },
      () => setPlaying(false)
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={PLAYLIST[track]}
        onEnded={handleEnded}
        // Enough of the file to start promptly on that first gesture, without
        // pulling five megabytes down for a guest who never interacts.
        preload="metadata"
        aria-hidden
      />
      {ready && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? 'Turn the music off' : 'Turn the music on'}
          title={playing ? 'Turn the music off' : 'Turn the music on'}
          className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/70 text-white shadow-lg backdrop-blur transition-colors duration-300 hover:bg-accent sm:bottom-7 sm:right-7"
        >
          {playing ? <Bars /> : <MutedNote />}
        </button>
      )}
    </>
  );
}

/** Three bars that rise and fall while a track is playing. */
function Bars() {
  return (
    <span aria-hidden className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="w-[3px] rounded-full bg-current music-bar"
          style={{ animationDelay: `${bar * 160}ms` }}
        />
      ))}
    </span>
  );
}

function MutedNote() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
      <path d="m3 3 18 18" />
    </svg>
  );
}
