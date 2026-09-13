export type ThemeKey = 'dusty-blue' | 'classic-green' | 'blush' | 'ivory-gold';

export interface ThemeDefinition {
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const THEMES: Record<ThemeKey, ThemeDefinition> = {
  'dusty-blue': {
    label: 'Dusty Blue',
    // The accent carries small uppercase type on white, so it is darkened
    // until it clears 4.5:1 rather than using the lighter swatch blue.
    colors: { primary: '#33506b', secondary: '#eef3f8', accent: '#4f7091' },
  },
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

export const DEFAULT_THEME: ThemeKey = 'dusty-blue';

export function isValidTheme(value: string): value is ThemeKey {
  return Object.prototype.hasOwnProperty.call(THEMES, value);
}
