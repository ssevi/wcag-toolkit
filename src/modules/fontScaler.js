import { injectStyle, removeStyle } from '../utils/dom.js';

/**
 * FontScaler — adjusts root font size for better readability
 */
export class FontScaler {
  constructor() {
    this.baseSize = 16;
    this.currentScale = 1;
    this.step = 0.1;
    this.min = 0.8;
    this.max = 2.0;
  }

  setScale(scale) {
    this.currentScale = Math.min(this.max, Math.max(this.min, scale));
    const size = Math.round(this.baseSize * this.currentScale);
    injectStyle('a11y-font-scaler', `:root { font-size: ${size}px !important; }`);
    return this.currentScale;
  }

  increase() {
    return this.setScale(this.currentScale + this.step);
  }

  decrease() {
    return this.setScale(this.currentScale - this.step);
  }

  reset() {
    this.currentScale = 1;
    removeStyle('a11y-font-scaler');
  }

  getScale() {
    return this.currentScale;
  }
}
