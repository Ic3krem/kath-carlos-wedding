import { Marck_Script, Poppins } from 'next/font/google';

export const marckScript = Marck_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
});

// Metropolis (the reference design's UI typeface) isn't on Google Fonts;
// Poppins is the closest freely-licensed geometric-sans match.
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-metropolis',
});
