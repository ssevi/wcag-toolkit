import { $$, injectStyle, removeStyle } from '../utils/dom.js';

/**
 * AriaHelper — scans for missing ARIA labels/roles and adds screen reader hints
 */
export class AriaHelper {
  constructor() {
    this.issues = [];
  }

  scan(root = document.body) {
    this.issues = [];

    // Images without alt
    $$(  'img:not([alt])', root).forEach(el => {
      this.issues.push({ el, type: 'missing-alt', msg: '<img> missing alt attribute' });
    });

    // Buttons without accessible name
    $$('button', root).forEach(el => {
      if (!el.textContent.trim() && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
        this.issues.push({ el, type: 'button-no-label', msg: '<button> has no accessible label' });
      }
    });

    // Inputs without labels
    $$('input, select, textarea', root).forEach(el => {
      const id = el.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
      if (!hasLabel && !hasAria) {
        this.issues.push({ el, type: 'input-no-label', msg: `<${el.tagName.toLowerCase()}> missing label` });
      }
    });

    // Links with no text
    $$('a', root).forEach(el => {
      if (!el.textContent.trim() && !el.getAttribute('aria-label')) {
        this.issues.push({ el, type: 'link-no-text', msg: '<a> has no text or aria-label' });
      }
    });

    // Interactive divs/spans without role
    $$('div[onclick], span[onclick]', root).forEach(el => {
      if (!el.getAttribute('role')) {
        this.issues.push({ el, type: 'missing-role', msg: 'Clickable element missing role' });
      }
    });

    console.group('🦻 A11y ARIA Report');
    console.log(`Issues found: ${this.issues.length}`);
    this.issues.forEach(({ msg, el }) => console.warn(msg, el));
    console.groupEnd();

    return this.issues;
  }

  fix(autoFix = false) {
    this.scan();
    if (!autoFix) return this.issues;

    this.issues.forEach(({ el, type }) => {
      if (type === 'missing-alt') el.setAttribute('alt', '');
      if (type === 'button-no-label') el.setAttribute('aria-label', el.title || 'Button');
      if (type === 'missing-role') el.setAttribute('role', 'button');
    });

    console.log('✅ AriaHelper: auto-fixed', this.issues.length, 'issues');
    return this.issues;
  }

  addHints() {
    this.scan();
    injectStyle('a11y-aria-hints', `
      [data-a11y-hint] {
        position: relative;
      }
      [data-a11y-hint]::after {
        content: attr(data-a11y-hint);
        position: absolute;
        bottom: 100%;
        left: 0;
        background: #333;
        color: #fff;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 99999;
        pointer-events: none;
        display: none;
      }
      [data-a11y-hint]:hover::after,
      [data-a11y-hint]:focus::after {
        display: block;
      }
    `);

    this.issues.forEach(({ el, msg }) => {
      el.setAttribute('data-a11y-hint', `⚠️ ${msg}`);
    });
  }

  clearHints() {
    $$('[data-a11y-hint]').forEach(el => el.removeAttribute('data-a11y-hint'));
    removeStyle('a11y-aria-hints');
  }
}
