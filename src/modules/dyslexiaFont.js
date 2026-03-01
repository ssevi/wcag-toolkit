import { injectStyle, removeStyle } from '../utils/dom.js';

// OpenDyslexic via CDN — loaded on demand
const FONT_FACE = `
  @import url('https://fonts.cdnfonts.com/css/opendyslexic');
`;

const DYSLEXIA_STYLE = `
  * {
    font-family: 'OpenDyslexic', 'Comic Sans MS', Arial, sans-serif !important;
    letter-spacing: 0.05em !important;
    word-spacing: 0.1em !important;
    line-height: 1.8 !important;
  }
`;

/**
 * DyslexiaFont — applies OpenDyslexic font and improved reading spacing
 */
export class DyslexiaFont {
  constructor() {
    this.enabled = false;
  }

  apply() {
    injectStyle('a11y-dyslexia-font', FONT_FACE + DYSLEXIA_STYLE);
    this.enabled = true;
    document.documentElement.setAttribute('data-a11y-dyslexia', 'true');
  }

  remove() {
    removeStyle('a11y-dyslexia-font');
    this.enabled = false;
    document.documentElement.removeAttribute('data-a11y-dyslexia');
  }

  toggle() {
    this.enabled ? this.remove() : this.apply();
  }
}
