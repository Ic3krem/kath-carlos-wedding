import { Cormorant_Garamond, Great_Vibes, Lato, Marck_Script, Montserrat } from 'next/font/google';

/** Body copy and headings. */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

/** Section titles and the date lines. */
export const marckScript = Marck_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
});

/** The couple's signature on the RSVP card. */
export const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vibes',
});

/** Small uppercase labels and buttons. */
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

/** The RSVP card's form copy. */
export const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  preload: false,
});
