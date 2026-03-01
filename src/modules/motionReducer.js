import { injectStyle, removeStyle } from '../utils/dom.js';

const REDUCED_MOTION_CSS = `
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
`;

/**
 * MotionReducer — disables animations and transitions for motion-sensitive users
 */
export class MotionReducer {
  constructor() {
    this.enabled = false;
    // Respect system preference on init
    this._mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  systemPrefers() {
    return this._mediaQuery.matches;
  }

  reduce() {
    injectStyle('a11y-motion-reducer', REDUCED_MOTION_CSS);
    this.enabled = true;
    document.documentElement.setAttribute('data-a11y-motion', 'reduced');
  }

  restore() {
    removeStyle('a11y-motion-reducer');
    this.enabled = false;
    document.documentElement.removeAttribute('data-a11y-motion');
  }

  toggle() {
    this.enabled ? this.restore() : this.reduce();
  }

  /**
   * Automatically apply based on OS/browser preference
   */
  autoDetect() {
    if (this.systemPrefers()) {
      this.reduce();
      console.log('🎞️ MotionReducer: system prefers reduced motion — applied');
    }
    this._mediaQuery.addEventListener('change', (e) => {
      e.matches ? this.reduce() : this.restore();
    });
  }
}
