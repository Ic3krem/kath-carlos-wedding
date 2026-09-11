export type ThemeKey = 'classic-green' | 'blush' | 'ivory-gold';

export interface ThemeDefinition {
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const THEMES: Record<ThemeKey, ThemeDefinition> = {
  'classic-green': {
    label: 'Classic Green',
    colors: { primary: '#2f4f3a', secondary: '#f5f1e6', accent: '#c9a24b' },
  },
  blush: {
    label: 'Blush',
    colors: { primary: '#b76e79', secondary: '#fff5f5', accent: '#d4af37' },
  },
  'ivory-gold': {
    label: 'Ivory & Gold',
    colors: { primary: '#8a6d3b', secondary: '#faf6ef', accent: '#c9a24b' },
  },
};

export const DEFAULT_THEME: ThemeKey = 'classic-green';

export function isValidTheme(value: string): value is ThemeKey {
  return Object.prototype.hasOwnProperty.call(THEMES, value);
}
