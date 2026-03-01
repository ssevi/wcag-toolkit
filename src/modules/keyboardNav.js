import { injectStyle, removeStyle } from '../utils/dom.js';

const KEYBOARD_NAV_CSS = `
  /* Enhanced focus ring for keyboard navigation */
  *:focus-visible {
    outline: 3px solid #005fcc !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 0 5px rgba(0, 95, 204, 0.25) !important;
    border-radius: 3px !important;
  }

  /* Navigation path tracker */
  .a11y-nav-visited {
    box-shadow: inset 0 0 0 2px rgba(0, 180, 100, 0.4) !important;
  }

  /* Skip to main content link */
  .a11y-skip-link {
    position: fixed !important;
    top: -100px;
    left: 16px;
    z-index: 999999;
    background: #005fcc;
    color: #fff;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    text-decoration: none;
    transition: top 0.15s;
  }
  .a11y-skip-link:focus {
    top: 16px !important;
  }
`;

/**
 * KeyboardNav — enhances keyboard navigation with visible focus rings and skip links
 */
export class KeyboardNav {
  constructor() {
    this.enabled = false;
    this._keyHandler = null;
    this._skipLink = null;
  }

  highlight() {
    injectStyle('a11y-keyboard-nav', KEYBOARD_NAV_CSS);
    this.enabled = true;

    // Track keyboard vs mouse usage
    this._keyHandler = () => {
      document.documentElement.setAttribute('data-a11y-keyboard', 'true');
    };
    document.addEventListener('keydown', this._keyHandler);

    document.addEventListener('mousedown', () => {
      document.documentElement.removeAttribute('data-a11y-keyboard');
    });

    this._injectSkipLink();
    console.log('⌨️ KeyboardNav: enhanced focus indicators active');
  }

  _injectSkipLink() {
    if (document.querySelector('.a11y-skip-link')) return;
    const main = document.querySelector('main, #main, [role="main"]');
    if (!main) return;

    if (!main.id) main.id = 'a11y-main-content';
    this._skipLink = document.createElement('a');
    this._skipLink.href = `#${main.id}`;
    this._skipLink.className = 'a11y-skip-link';
    this._skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(this._skipLink, document.body.firstChild);
  }

  remove() {
    removeStyle('a11y-keyboard-nav');
    this.enabled = false;
    if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
    if (this._skipLink) this._skipLink.remove();
    document.documentElement.removeAttribute('data-a11y-keyboard');
  }

  toggle() {
    this.enabled ? this.remove() : this.highlight();
  }
}
