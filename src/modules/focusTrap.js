/**
 * FocusTrap — traps keyboard focus within a given element (e.g. modals, dialogs)
 */

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
  'input:not([disabled])', 'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export class FocusTrap {
  constructor() {
    this._trapped = null;
    this._handler = null;
    this._previousFocus = null;
  }

  trap(element) {
    if (!element) throw new Error('FocusTrap: element is required');
    this.release(); // release any existing trap

    this._trapped = element;
    this._previousFocus = document.activeElement;

    const focusables = () => Array.from(element.querySelectorAll(FOCUSABLE)).filter(
      el => !el.closest('[hidden]') && el.offsetParent !== null
    );

    this._handler = (e) => {
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) { e.preventDefault(); return; }

      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', this._handler);

    // Focus first focusable element
    const first = focusables()[0];
    if (first) first.focus();

    element.setAttribute('data-a11y-trapped', 'true');
    console.log('🔒 FocusTrap: active on', element);
  }

  release() {
    if (!this._trapped) return;
    document.removeEventListener('keydown', this._handler);
    this._trapped.removeAttribute('data-a11y-trapped');
    this._trapped = null;
    this._handler = null;

    if (this._previousFocus) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }
    console.log('🔓 FocusTrap: released');
  }

  isActive() {
    return !!this._trapped;
  }
}
