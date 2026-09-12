'use client';

import dynamic from 'next/dynamic';

// RsvpModal is an interaction-only overlay (renders null until triggered);
// loading it lazily on the client keeps its form code out of the initial
// bundle. next/dynamic's `ssr: false` option can only be used from a Client
// Component, hence this thin wrapper around the server-rendered page.
export const RsvpModal = dynamic(() => import('./RsvpModal').then((m) => m.RsvpModal), { ssr: false });
