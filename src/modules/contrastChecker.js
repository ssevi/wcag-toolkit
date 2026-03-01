import { $$, getLuminance, getContrastRatio, parseColor } from '../utils/dom.js';

/**
 * ContrastChecker — scans the DOM for WCAG contrast violations
 * Developer: contrastChecker.run() → returns report
 * End-user: highlights failing elements visually
 */
export class ContrastChecker {
  constructor() {
    this.violations = [];
  }

  _getComputedColors(el) {
    const style = window.getComputedStyle(el);
    return {
      fg: style.color,
      bg: style.backgroundColor,
      fontSize: parseFloat(style.fontSize),
      fontWeight: style.fontWeight,
    };
  }

  _isLargeText(fontSize, fontWeight) {
    return fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);
  }

  _checkElement(el) {
    try {
      const { fg, bg, fontSize, fontWeight } = this._getComputedColors(el);
      if (!fg || !bg || bg === 'rgba(0, 0, 0, 0)') return null;

      const fgColor = parseColor(fg);
      const bgColor = parseColor(bg);
      const fgLum = getLuminance(fgColor.r, fgColor.g, fgColor.b);
      const bgLum = getLuminance(bgColor.r, bgColor.g, bgColor.b);
      const ratio = getContrastRatio(fgLum, bgLum);
      const isLarge = this._isLargeText(fontSize, fontWeight);
      const required = isLarge ? 3.0 : 4.5;
      const passes = ratio >= required;

      return { el, ratio: ratio.toFixed(2), required, passes, fg, bg };
    } catch {
      return null;
    }
  }

  run(root = document.body) {
    this.violations = [];
    const textElements = $$('p, h1, h2, h3, h4, h5, h6, span, a, button, label, li, td, th', root);

    const results = textElements
      .map(el => this._checkElement(el))
      .filter(Boolean);

    this.violations = results.filter(r => !r.passes);

    console.group('🎨 A11y Contrast Report');
    console.log(`Scanned: ${results.length} elements`);
    console.log(`Passed: ${results.length - this.violations.length}`);
    console.log(`Failed: ${this.violations.length}`);
    this.violations.forEach(v => {
      console.warn(`Contrast ${v.ratio}:1 (need ${v.required}:1)`, v.el);
    });
    console.groupEnd();

    return { total: results.length, violations: this.violations };
  }

  highlight() {
    this.run();
    this.violations.forEach(({ el, ratio, required }) => {
      el.style.outline = '3px solid red';
      el.setAttribute('title', `⚠️ Contrast ${ratio}:1 — needs ${required}:1`);
    });
  }

  clear() {
    $$('[data-a11y-contrast]').forEach(el => {
      el.style.outline = '';
      el.removeAttribute('title');
    });
  }
}
