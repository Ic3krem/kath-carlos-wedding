'use client';

import { useEffect, useState } from 'react';
import { getCountdownParts, type CountdownParts } from '@/lib/countdown';
import { poppins } from '@/lib/fonts';

const UNITS: { key: keyof Omit<CountdownParts, 'isPast'>; label: string }[] = [
  { key: 'months', label: 'Months' },
  { key: 'weeks', label: 'Weeks' },
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
];

export function Countdown({ weddingDate }: { weddingDate: string }) {
  const target = new Date(weddingDate);
  const [parts, setParts] = useState<CountdownParts>(() => getCountdownParts(target));

  useEffect(() => {
    const interval = setInterval(() => setParts(getCountdownParts(target)), 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  return (
    <div
      style={{
        width: '100%',
        alignSelf: 'stretch',
        background: 'black',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        display: 'flex',
      }}
    >
      <div style={{ alignSelf: 'stretch', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
        <div style={{ textAlign: 'center', color: 'white', fontSize: 40, fontFamily: poppins.style.fontFamily, fontWeight: '600', wordWrap: 'break-word' }}>
          {parts.isPast ? 'WE ARE MARRIED!' : 'LIVE COUNTDOWN'}
        </div>
      </div>
      {!parts.isPast && (
        <div
          style={{
            alignSelf: 'stretch',
            paddingTop: 37,
            paddingBottom: 115,
            paddingLeft: 522,
            paddingRight: 522,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'inline-flex',
          }}
        >
          {UNITS.map(({ key, label }) => (
            <div
              key={key}
              style={{
                paddingTop: 20,
                paddingBottom: 20,
                overflow: 'hidden',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'inline-flex',
              }}
            >
              <div
                style={{
                  width: 147,
                  height: 55,
                  textAlign: 'center',
                  justifyContent: 'flex-end',
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'white',
                  fontSize: 48,
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: '600',
                  wordWrap: 'break-word',
                }}
              >
                {String(parts[key]).padStart(2, '0')}
              </div>
              <div
                style={{
                  textAlign: 'center',
                  justifyContent: 'flex-end',
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'white',
                  fontSize: 16,
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: '600',
                  wordWrap: 'break-word',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
