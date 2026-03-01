import './panel.css';

/**
 * Panel — injects a floating accessibility widget into the page
 * Connects all modules to UI toggles
 */
export class Panel {
  constructor(modules) {
    this.modules = modules;
    this._el = null;
    this._drawer = null;
    this._visible = false;
  }

  mount() {
    if (document.getElementById('a11y-panel')) return;
    this._el = this._buildPanel();
    document.body.appendChild(this._el);
    this._bindEvents();
  }

  unmount() {
    if (this._el) { this._el.remove(); this._el = null; }
  }

  _buildPanel() {
    const wrap = document.createElement('div');
    wrap.id = 'a11y-panel';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Accessibility Tools');

    // Drawer
    this._drawer = document.createElement('div');
    this._drawer.id = 'a11y-drawer';
    this._drawer.className = 'hidden';
    this._drawer.setAttribute('role', 'dialog');
    this._drawer.setAttribute('aria-modal', 'false');
    this._drawer.setAttribute('aria-label', 'Accessibility options');
    this._drawer.innerHTML = this._drawerHTML();

    // Trigger
    const trigger = document.createElement('button');
    trigger.id = 'a11y-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'a11y-drawer');
    trigger.setAttribute('aria-label', 'Open accessibility tools');
    trigger.textContent = '♿';

    wrap.appendChild(this._drawer);
    wrap.appendChild(trigger);
    return wrap;
  }

  _drawerHTML() {
    return `
      <div class="a11y-panel-header">
        <h2>⚙️ Accessibility Tools</h2>
        <button class="a11y-panel-close" aria-label="Close accessibility panel">✕</button>
      </div>

      <div class="a11y-section">
        <div class="a11y-section-label">Visual</div>

        <div class="a11y-toggle-row">
          <span>High Contrast</span>
          <label class="a11y-switch">
            <input type="checkbox" data-a11y-action="highContrast" aria-label="Toggle high contrast">
            <span class="a11y-switch-slider"></span>
          </label>
        </div>

        <div class="a11y-toggle-row">
          <span>Dark Mode</span>
          <label class="a11y-switch">
            <input type="checkbox" data-a11y-action="darkMode" aria-label="Toggle dark mode">
            <span class="a11y-switch-slider"></span>
          </label>
        </div>

        <div class="a11y-toggle-row">
          <span>Dyslexia Font</span>
          <label class="a11y-switch">
            <input type="checkbox" data-a11y-action="dyslexiaFont" aria-label="Toggle dyslexia-friendly font">
            <span class="a11y-switch-slider"></span>
          </label>
        </div>

        <div class="a11y-scaler-row">
          <span>Font Size</span>
          <button class="a11y-scale-btn" data-a11y-action="fontDecrease" aria-label="Decrease font size">−</button>
          <span class="a11y-scale-display" id="a11y-scale-val">100%</span>
          <button class="a11y-scale-btn" data-a11y-action="fontIncrease" aria-label="Increase font size">+</button>
        </div>
      </div>

      <div class="a11y-section">
        <div class="a11y-section-label">Motion & Navigation</div>

        <div class="a11y-toggle-row">
          <span>Reduce Motion</span>
          <label class="a11y-switch">
            <input type="checkbox" data-a11y-action="motionReducer" aria-label="Toggle reduce motion">
            <span class="a11y-switch-slider"></span>
          </label>
        </div>

        <div class="a11y-toggle-row">
          <span>Keyboard Focus Rings</span>
          <label class="a11y-switch">
            <input type="checkbox" data-a11y-action="keyboardNav" aria-label="Toggle keyboard navigation highlights">
            <span class="a11y-switch-slider"></span>
          </label>
        </div>
      </div>

      <div class="a11y-section">
        <div class="a11y-section-label">Audit (Dev)</div>
        <button class="a11y-audit-btn" data-a11y-action="auditContrast">🎨 Check Contrast</button>
        <button class="a11y-audit-btn" data-a11y-action="auditAria" style="margin-top:6px">🦻 Scan ARIA Issues</button>
      </div>

      <div class="a11y-panel-footer">a11y-toolkit · WCAG 2.1 AA</div>
    `;
  }

  _bindEvents() {
    const { highContrast, dyslexiaFont, fontScaler, motionReducer, keyboardNav, contrastChecker, ariaHelper } = this.modules;

    const trigger = this._el.querySelector('#a11y-trigger');
    const closeBtn = this._el.querySelector('.a11y-panel-close');

    trigger.addEventListener('click', () => this._toggle());
    closeBtn.addEventListener('click', () => this._hide());

    this._drawer.addEventListener('change', (e) => {
      const action = e.target.dataset.a11yAction;
      const checked = e.target.checked;

      if (action === 'highContrast') highContrast.toggle('highContrast');
      if (action === 'darkMode') highContrast.toggle('dark');
      if (action === 'dyslexiaFont') dyslexiaFont.toggle();
      if (action === 'motionReducer') motionReducer.toggle();
      if (action === 'keyboardNav') keyboardNav.toggle();
    });

    this._drawer.addEventListener('click', (e) => {
      const action = e.target.dataset.a11yAction;
      if (!action) return;

      if (action === 'fontIncrease') {
        const scale = fontScaler.increase();
        this._updateScaleDisplay(scale);
      }
      if (action === 'fontDecrease') {
        const scale = fontScaler.decrease();
        this._updateScaleDisplay(scale);
      }
      if (action === 'auditContrast') {
        contrastChecker.highlight();
        alert(`Contrast audit complete. ${contrastChecker.violations.length} issue(s) found. Check the console for details.`);
      }
      if (action === 'auditAria') {
        ariaHelper.addHints();
        alert(`ARIA scan complete. ${ariaHelper.issues.length} issue(s) found. Hover elements to see hints.`);
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._visible) this._hide();
    });
  }

  _updateScaleDisplay(scale) {
    const el = this._el.querySelector('#a11y-scale-val');
    if (el) el.textContent = `${Math.round(scale * 100)}%`;
  }

  _toggle() {
    this._visible ? this._hide() : this._show();
  }

  _show() {
    this._drawer.classList.remove('hidden');
    this._visible = true;
    this._el.querySelector('#a11y-trigger').setAttribute('aria-expanded', 'true');
  }

  _hide() {
    this._drawer.classList.add('hidden');
    this._visible = false;
    this._el.querySelector('#a11y-trigger').setAttribute('aria-expanded', 'false');
    this._el.querySelector('#a11y-trigger').focus();
  }
}
