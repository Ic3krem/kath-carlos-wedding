import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { THEMES, type ThemeKey } from '@/lib/theme';

/**
 * `src/lib/theme.ts` and `src/app/globals.css` both hardcode the same theme
 * hex values independently (per `[data-theme='...']` block in the CSS). This
 * test parses the CSS blocks and asserts they match `THEMES` exactly, so an
 * edit to one that isn't mirrored in the other fails CI instead of silently
 * drifting.
 */

const CSS_VAR_TO_COLOR_KEY = {
  '--color-primary': 'primary',
  '--color-secondary': 'secondary',
  '--color-accent': 'accent',
} as const;

function parseThemeBlocksFromCss(css: string): Record<string, Record<string, string>> {
  const blocks: Record<string, Record<string, string>> = {};
  const blockRegex = /\[data-theme=['"]([^'"]+)['"]\]\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(css)) !== null) {
    const [, themeKey, body] = match;
    const colors: Record<string, string> = {};
    for (const [cssVar, colorKey] of Object.entries(CSS_VAR_TO_COLOR_KEY)) {
      const varRegex = new RegExp(`${cssVar}\\s*:\\s*([^;]+);`);
      const varMatch = body.match(varRegex);
      if (varMatch) {
        colors[colorKey] = varMatch[1].trim();
      }
    }
    blocks[themeKey] = colors;
  }
  return blocks;
}

describe('theme.ts <-> globals.css sync', () => {
  const cssPath = path.resolve(__dirname, '../../src/app/globals.css');
  const css = readFileSync(cssPath, 'utf-8');
  const cssThemes = parseThemeBlocksFromCss(css);

  it('finds a [data-theme] block in globals.css for every THEMES entry', () => {
    for (const key of Object.keys(THEMES) as ThemeKey[]) {
      expect(cssThemes[key], `globals.css is missing a [data-theme='${key}'] block`).toBeDefined();
    }
  });

  it('has no [data-theme] blocks in globals.css that are missing from THEMES', () => {
    for (const key of Object.keys(cssThemes)) {
      expect(THEMES[key as ThemeKey], `globals.css has a [data-theme='${key}'] block not present in THEMES`).toBeDefined();
    }
  });

  it('matches every hex value between THEMES and globals.css, per theme', () => {
    for (const [key, definition] of Object.entries(THEMES) as [ThemeKey, (typeof THEMES)[ThemeKey]][]) {
      const cssColors = cssThemes[key];
      expect(cssColors, `globals.css is missing a [data-theme='${key}'] block`).toBeDefined();
      expect(cssColors.primary, `primary color mismatch for theme "${key}"`).toBe(definition.colors.primary);
      expect(cssColors.secondary, `secondary color mismatch for theme "${key}"`).toBe(definition.colors.secondary);
      expect(cssColors.accent, `accent color mismatch for theme "${key}"`).toBe(definition.colors.accent);
    }
  });
});
