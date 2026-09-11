import { describe, it, expect } from 'vitest';
import { THEMES, DEFAULT_THEME, isValidTheme } from '@/lib/theme';

describe('theme utility', () => {
  it('includes the default theme as a valid key', () => {
    expect(THEMES[DEFAULT_THEME]).toBeDefined();
  });

  it('validates known theme keys', () => {
    expect(isValidTheme('classic-green')).toBe(true);
    expect(isValidTheme('blush')).toBe(true);
    expect(isValidTheme('not-a-theme')).toBe(false);
  });
});
