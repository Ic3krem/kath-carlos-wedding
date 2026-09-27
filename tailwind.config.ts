import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dusty-blue palette from the 2026 design.
        ink: '#2c3e50',
        body: '#4a5d6e',
        muted: '#6b7f91',
        label: '#6b8aa8',
        steel: { DEFAULT: '#4f6f8f', dark: '#3f5b77', deep: '#2f465d' },
        dusty: '#8aa4bb',
        mist: '#dce7f0',
        line: '#c8d7e4',
        paper: '#f5f9fc',
        haze: '#eaf1f7',
        footer: '#56789a',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        script: ['var(--font-script)', 'cursive'],
        vibes: ['var(--font-vibes)', 'cursive'],
        sans: ['var(--font-sans)', 'sans-serif'],
        lato: ['var(--font-lato)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 18px rgba(79,111,143,0.1)',
        soft: '0 2px 10px rgba(79,111,143,0.08)',
        photo: '0 10px 30px rgba(44,62,80,0.18)',
      },
    },
  },
  plugins: [],
};
export default config;
