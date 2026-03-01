import { ContrastChecker } from '../modules/contrastChecker.js';
import { FontScaler } from '../modules/fontScaler.js';
import { FocusTrap } from '../modules/focusTrap.js';
import { AriaHelper } from '../modules/ariaHelper.js';
import { HighContrast } from '../modules/highContrast.js';
import { DyslexiaFont } from '../modules/dyslexiaFont.js';
import { MotionReducer } from '../modules/motionReducer.js';
import { KeyboardNav } from '../modules/keyboardNav.js';
import { Panel } from '../ui/panel.js';

/**
 * A11yToolkit — Central controller
 *
 * Modes:
 *  - 'panel'  : mounts a floating UI panel for end-users
 *  - 'audit'  : developer mode, exposes all modules via JS API
 *  - 'both'   : mounts panel AND exposes API (default)
 */
export class A11yToolkit {
  constructor(options = {}) {
    const { mode = 'both', autoDetectMotion = true } = options;

    // Instantiate all modules
    this.contrastChecker = new ContrastChecker();
    this.fontScaler      = new FontScaler();
    this.focusTrap       = new FocusTrap();
    this.ariaHelper      = new AriaHelper();
    this.highContrast    = new HighContrast();
    this.dyslexiaFont    = new DyslexiaFont();
    this.motionReducer   = new MotionReducer();
    this.keyboardNav     = new KeyboardNav();

    this._panel = null;
    this._mode = mode;

    if (autoDetectMotion) {
      this.motionReducer.autoDetect();
    }

    if (mode === 'panel' || mode === 'both') {
      this._panel = new Panel({
        contrastChecker: this.contrastChecker,
        fontScaler:      this.fontScaler,
        focusTrap:       this.focusTrap,
        ariaHelper:      this.ariaHelper,
        highContrast:    this.highContrast,
        dyslexiaFont:    this.dyslexiaFont,
        motionReducer:   this.motionReducer,
        keyboardNav:     this.keyboardNav,
      });
    }
  }

  /**
   * Mount the floating UI panel (call after DOM is ready)
   */
  mount() {
    if (!this._panel) {
      console.warn('A11yToolkit: panel is not initialized. Use mode "panel" or "both".');
      return;
    }
    this._panel.mount();
    console.log('♿ A11yToolkit: panel mounted');
    return this;
  }

  /**
   * Run a full audit and return results (for developer use)
   */
  audit(root = document.body) {
    const contrast = this.contrastChecker.run(root);
    const aria     = this.ariaHelper.scan(root);
    return { contrast, aria };
  }

  /**
   * Unmount the panel and clean up
   */
  destroy() {
    if (this._panel) this._panel.unmount();
    this.highContrast.disable();
    this.dyslexiaFont.remove();
    this.fontScaler.reset();
    this.motionReducer.restore();
    this.keyboardNav.remove();
    this.focusTrap.release();
  }
}
