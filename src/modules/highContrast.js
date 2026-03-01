import { injectStyle, removeStyle } from '../utils/dom.js';

const THEMES = {
  highContrast: `
    * {
      background-color: #000 !important;
      color: #fff !important;
      border-color: #fff !important;
    }
    a, a * { color: #ff0 !important; }
    button, [role="button"] {
      background-color: #fff !important;
      color: #000 !important;
      border: 2px solid #ff0 !important;
    }
    img { filter: grayscale(100%) contrast(120%) !important; }
  `,
  dark: `
    html {
      filter: invert(1) hue-rotate(180deg) !important;
    }
    img, video, canvas, svg {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `,
};

/**
 * HighContrast — toggles high contrast or dark mode
 */
export class HighContrast {
  constructor() {
    this.activeTheme = null;
  }

  enable(theme = 'highContrast') {
    if (!THEMES[theme]) {
      console.warn(`A11y HighContrast: unknown theme "${theme}". Use "highContrast" or "dark".`);
      return;
    }
    this.disable(); // remove previous
    this.activeTheme = theme;
    injectStyle('a11y-high-contrast', THEMES[theme]);
    document.documentElement.setAttribute('data-a11y-theme', theme);
  }

  disable() {
    removeStyle('a11y-high-contrast');
    document.documentElement.removeAttribute('data-a11y-theme');
    this.activeTheme = null;
  }

  toggle(theme = 'highContrast') {
    this.activeTheme === theme ? this.disable() : this.enable(theme);
  }

  isActive() {
    return !!this.activeTheme;
  }
}
