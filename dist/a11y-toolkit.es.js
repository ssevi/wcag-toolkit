function d(s, t = document) {
  return Array.from(t.querySelectorAll(s));
}
function u(s, t) {
  if (document.getElementById(s)) return;
  const e = document.createElement("style");
  e.id = s, e.textContent = t, document.head.appendChild(e);
}
function p(s) {
  const t = document.getElementById(s);
  t && t.remove();
}
function b(s, t, e) {
  const [a, i, n] = [s, t, e].map((o) => (o /= 255, o <= 0.03928 ? o / 12.92 : Math.pow((o + 0.055) / 1.055, 2.4)));
  return 0.2126 * a + 0.7152 * i + 0.0722 * n;
}
function k(s, t) {
  const e = Math.max(s, t), a = Math.min(s, t);
  return (e + 0.05) / (a + 0.05);
}
function g(s) {
  const t = document.createElement("canvas");
  t.width = t.height = 1;
  const e = t.getContext("2d");
  e.fillStyle = s, e.fillRect(0, 0, 1, 1);
  const [a, i, n] = e.getImageData(0, 0, 1, 1).data;
  return { r: a, g: i, b: n };
}
class _ {
  constructor() {
    this.violations = [];
  }
  _getComputedColors(t) {
    const e = window.getComputedStyle(t);
    return {
      fg: e.color,
      bg: e.backgroundColor,
      fontSize: parseFloat(e.fontSize),
      fontWeight: e.fontWeight
    };
  }
  _isLargeText(t, e) {
    return t >= 18 || t >= 14 && parseInt(e) >= 700;
  }
  _checkElement(t) {
    try {
      const { fg: e, bg: a, fontSize: i, fontWeight: n } = this._getComputedColors(t);
      if (!e || !a || a === "rgba(0, 0, 0, 0)") return null;
      const o = g(e), l = g(a), m = b(o.r, o.g, o.b), y = b(l.r, l.g, l.b), c = k(m, y), h = this._isLargeText(i, n) ? 3 : 4.5, v = c >= h;
      return { el: t, ratio: c.toFixed(2), required: h, passes: v, fg: e, bg: a };
    } catch {
      return null;
    }
  }
  run(t = document.body) {
    this.violations = [];
    const a = d("p, h1, h2, h3, h4, h5, h6, span, a, button, label, li, td, th", t).map((i) => this._checkElement(i)).filter(Boolean);
    return this.violations = a.filter((i) => !i.passes), console.group("🎨 A11y Contrast Report"), console.log(`Scanned: ${a.length} elements`), console.log(`Passed: ${a.length - this.violations.length}`), console.log(`Failed: ${this.violations.length}`), this.violations.forEach((i) => {
      console.warn(`Contrast ${i.ratio}:1 (need ${i.required}:1)`, i.el);
    }), console.groupEnd(), { total: a.length, violations: this.violations };
  }
  highlight() {
    this.run(), this.violations.forEach(({ el: t, ratio: e, required: a }) => {
      t.style.outline = "3px solid red", t.setAttribute("title", `⚠️ Contrast ${e}:1 — needs ${a}:1`);
    });
  }
  clear() {
    d("[data-a11y-contrast]").forEach((t) => {
      t.style.outline = "", t.removeAttribute("title");
    });
  }
}
class x {
  constructor() {
    this.baseSize = 16, this.currentScale = 1, this.step = 0.1, this.min = 0.8, this.max = 2;
  }
  setScale(t) {
    this.currentScale = Math.min(this.max, Math.max(this.min, t));
    const e = Math.round(this.baseSize * this.currentScale);
    return u("a11y-font-scaler", `:root { font-size: ${e}px !important; }`), this.currentScale;
  }
  increase() {
    return this.setScale(this.currentScale + this.step);
  }
  decrease() {
    return this.setScale(this.currentScale - this.step);
  }
  reset() {
    this.currentScale = 1, p("a11y-font-scaler");
  }
  getScale() {
    return this.currentScale;
  }
}
const A = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");
class w {
  constructor() {
    this._trapped = null, this._handler = null, this._previousFocus = null;
  }
  trap(t) {
    if (!t) throw new Error("FocusTrap: element is required");
    this.release(), this._trapped = t, this._previousFocus = document.activeElement;
    const e = () => Array.from(t.querySelectorAll(A)).filter(
      (i) => !i.closest("[hidden]") && i.offsetParent !== null
    );
    this._handler = (i) => {
      if (i.key !== "Tab") return;
      const n = e();
      if (!n.length) {
        i.preventDefault();
        return;
      }
      const o = n[0], l = n[n.length - 1];
      i.shiftKey ? document.activeElement === o && (i.preventDefault(), l.focus()) : document.activeElement === l && (i.preventDefault(), o.focus());
    }, document.addEventListener("keydown", this._handler);
    const a = e()[0];
    a && a.focus(), t.setAttribute("data-a11y-trapped", "true"), console.log("🔒 FocusTrap: active on", t);
  }
  release() {
    this._trapped && (document.removeEventListener("keydown", this._handler), this._trapped.removeAttribute("data-a11y-trapped"), this._trapped = null, this._handler = null, this._previousFocus && (this._previousFocus.focus(), this._previousFocus = null), console.log("🔓 FocusTrap: released"));
  }
  isActive() {
    return !!this._trapped;
  }
}
class E {
  constructor() {
    this.issues = [];
  }
  scan(t = document.body) {
    return this.issues = [], d("img:not([alt])", t).forEach((e) => {
      this.issues.push({ el: e, type: "missing-alt", msg: "<img> missing alt attribute" });
    }), d("button", t).forEach((e) => {
      !e.textContent.trim() && !e.getAttribute("aria-label") && !e.getAttribute("aria-labelledby") && this.issues.push({ el: e, type: "button-no-label", msg: "<button> has no accessible label" });
    }), d("input, select, textarea", t).forEach((e) => {
      const a = e.id, i = a && document.querySelector(`label[for="${a}"]`), n = e.getAttribute("aria-label") || e.getAttribute("aria-labelledby");
      !i && !n && this.issues.push({ el: e, type: "input-no-label", msg: `<${e.tagName.toLowerCase()}> missing label` });
    }), d("a", t).forEach((e) => {
      !e.textContent.trim() && !e.getAttribute("aria-label") && this.issues.push({ el: e, type: "link-no-text", msg: "<a> has no text or aria-label" });
    }), d("div[onclick], span[onclick]", t).forEach((e) => {
      e.getAttribute("role") || this.issues.push({ el: e, type: "missing-role", msg: "Clickable element missing role" });
    }), console.group("🦻 A11y ARIA Report"), console.log(`Issues found: ${this.issues.length}`), this.issues.forEach(({ msg: e, el: a }) => console.warn(e, a)), console.groupEnd(), this.issues;
  }
  fix(t = !1) {
    return this.scan(), t ? (this.issues.forEach(({ el: e, type: a }) => {
      a === "missing-alt" && e.setAttribute("alt", ""), a === "button-no-label" && e.setAttribute("aria-label", e.title || "Button"), a === "missing-role" && e.setAttribute("role", "button");
    }), console.log("✅ AriaHelper: auto-fixed", this.issues.length, "issues"), this.issues) : this.issues;
  }
  addHints() {
    this.scan(), u("a11y-aria-hints", `
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
    `), this.issues.forEach(({ el: t, msg: e }) => {
      t.setAttribute("data-a11y-hint", `⚠️ ${e}`);
    });
  }
  clearHints() {
    d("[data-a11y-hint]").forEach((t) => t.removeAttribute("data-a11y-hint")), p("a11y-aria-hints");
  }
}
const f = {
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
  `
};
class C {
  constructor() {
    this.activeTheme = null;
  }
  enable(t = "highContrast") {
    if (!f[t]) {
      console.warn(`A11y HighContrast: unknown theme "${t}". Use "highContrast" or "dark".`);
      return;
    }
    this.disable(), this.activeTheme = t, u("a11y-high-contrast", f[t]), document.documentElement.setAttribute("data-a11y-theme", t);
  }
  disable() {
    p("a11y-high-contrast"), document.documentElement.removeAttribute("data-a11y-theme"), this.activeTheme = null;
  }
  toggle(t = "highContrast") {
    this.activeTheme === t ? this.disable() : this.enable(t);
  }
  isActive() {
    return !!this.activeTheme;
  }
}
const S = `
  @import url('https://fonts.cdnfonts.com/css/opendyslexic');
`, L = `
  * {
    font-family: 'OpenDyslexic', 'Comic Sans MS', Arial, sans-serif !important;
    letter-spacing: 0.05em !important;
    word-spacing: 0.1em !important;
    line-height: 1.8 !important;
  }
`;
class T {
  constructor() {
    this.enabled = !1;
  }
  apply() {
    u("a11y-dyslexia-font", S + L), this.enabled = !0, document.documentElement.setAttribute("data-a11y-dyslexia", "true");
  }
  remove() {
    p("a11y-dyslexia-font"), this.enabled = !1, document.documentElement.removeAttribute("data-a11y-dyslexia");
  }
  toggle() {
    this.enabled ? this.remove() : this.apply();
  }
}
const F = `
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
`;
class H {
  constructor() {
    this.enabled = !1, this._mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  }
  systemPrefers() {
    return this._mediaQuery.matches;
  }
  reduce() {
    u("a11y-motion-reducer", F), this.enabled = !0, document.documentElement.setAttribute("data-a11y-motion", "reduced");
  }
  restore() {
    p("a11y-motion-reducer"), this.enabled = !1, document.documentElement.removeAttribute("data-a11y-motion");
  }
  toggle() {
    this.enabled ? this.restore() : this.reduce();
  }
  /**
   * Automatically apply based on OS/browser preference
   */
  autoDetect() {
    this.systemPrefers() && (this.reduce(), console.log("🎞️ MotionReducer: system prefers reduced motion — applied")), this._mediaQuery.addEventListener("change", (t) => {
      t.matches ? this.reduce() : this.restore();
    });
  }
}
const D = `
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
class M {
  constructor() {
    this.enabled = !1, this._keyHandler = null, this._skipLink = null;
  }
  highlight() {
    u("a11y-keyboard-nav", D), this.enabled = !0, this._keyHandler = () => {
      document.documentElement.setAttribute("data-a11y-keyboard", "true");
    }, document.addEventListener("keydown", this._keyHandler), document.addEventListener("mousedown", () => {
      document.documentElement.removeAttribute("data-a11y-keyboard");
    }), this._injectSkipLink(), console.log("⌨️ KeyboardNav: enhanced focus indicators active");
  }
  _injectSkipLink() {
    if (document.querySelector(".a11y-skip-link")) return;
    const t = document.querySelector('main, #main, [role="main"]');
    t && (t.id || (t.id = "a11y-main-content"), this._skipLink = document.createElement("a"), this._skipLink.href = `#${t.id}`, this._skipLink.className = "a11y-skip-link", this._skipLink.textContent = "Skip to main content", document.body.insertBefore(this._skipLink, document.body.firstChild));
  }
  remove() {
    p("a11y-keyboard-nav"), this.enabled = !1, this._keyHandler && document.removeEventListener("keydown", this._keyHandler), this._skipLink && this._skipLink.remove(), document.documentElement.removeAttribute("data-a11y-keyboard");
  }
  toggle() {
    this.enabled ? this.remove() : this.highlight();
  }
}
class R {
  constructor(t) {
    this.modules = t, this._el = null, this._drawer = null, this._visible = !1;
  }
  mount() {
    document.getElementById("a11y-panel") || (this._el = this._buildPanel(), document.body.appendChild(this._el), this._bindEvents());
  }
  unmount() {
    this._el && (this._el.remove(), this._el = null);
  }
  _buildPanel() {
    const t = document.createElement("div");
    t.id = "a11y-panel", t.setAttribute("role", "region"), t.setAttribute("aria-label", "Accessibility Tools"), this._drawer = document.createElement("div"), this._drawer.id = "a11y-drawer", this._drawer.className = "hidden", this._drawer.setAttribute("role", "dialog"), this._drawer.setAttribute("aria-modal", "false"), this._drawer.setAttribute("aria-label", "Accessibility options"), this._drawer.innerHTML = this._drawerHTML();
    const e = document.createElement("button");
    return e.id = "a11y-trigger", e.setAttribute("aria-expanded", "false"), e.setAttribute("aria-controls", "a11y-drawer"), e.setAttribute("aria-label", "Open accessibility tools"), e.textContent = "♿", t.appendChild(this._drawer), t.appendChild(e), t;
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
    const { highContrast: t, dyslexiaFont: e, fontScaler: a, motionReducer: i, keyboardNav: n, contrastChecker: o, ariaHelper: l } = this.modules, m = this._el.querySelector("#a11y-trigger"), y = this._el.querySelector(".a11y-panel-close");
    m.addEventListener("click", () => this._toggle()), y.addEventListener("click", () => this._hide()), this._drawer.addEventListener("change", (c) => {
      const r = c.target.dataset.a11yAction;
      c.target.checked, r === "highContrast" && t.toggle("highContrast"), r === "darkMode" && t.toggle("dark"), r === "dyslexiaFont" && e.toggle(), r === "motionReducer" && i.toggle(), r === "keyboardNav" && n.toggle();
    }), this._drawer.addEventListener("click", (c) => {
      const r = c.target.dataset.a11yAction;
      if (r) {
        if (r === "fontIncrease") {
          const h = a.increase();
          this._updateScaleDisplay(h);
        }
        if (r === "fontDecrease") {
          const h = a.decrease();
          this._updateScaleDisplay(h);
        }
        r === "auditContrast" && (o.highlight(), alert(`Contrast audit complete. ${o.violations.length} issue(s) found. Check the console for details.`)), r === "auditAria" && (l.addHints(), alert(`ARIA scan complete. ${l.issues.length} issue(s) found. Hover elements to see hints.`));
      }
    }), document.addEventListener("keydown", (c) => {
      c.key === "Escape" && this._visible && this._hide();
    });
  }
  _updateScaleDisplay(t) {
    const e = this._el.querySelector("#a11y-scale-val");
    e && (e.textContent = `${Math.round(t * 100)}%`);
  }
  _toggle() {
    this._visible ? this._hide() : this._show();
  }
  _show() {
    this._drawer.classList.remove("hidden"), this._visible = !0, this._el.querySelector("#a11y-trigger").setAttribute("aria-expanded", "true");
  }
  _hide() {
    this._drawer.classList.add("hidden"), this._visible = !1, this._el.querySelector("#a11y-trigger").setAttribute("aria-expanded", "false"), this._el.querySelector("#a11y-trigger").focus();
  }
}
class $ {
  constructor(t = {}) {
    const { mode: e = "both", autoDetectMotion: a = !0 } = t;
    this.contrastChecker = new _(), this.fontScaler = new x(), this.focusTrap = new w(), this.ariaHelper = new E(), this.highContrast = new C(), this.dyslexiaFont = new T(), this.motionReducer = new H(), this.keyboardNav = new M(), this._panel = null, this._mode = e, a && this.motionReducer.autoDetect(), (e === "panel" || e === "both") && (this._panel = new R({
      contrastChecker: this.contrastChecker,
      fontScaler: this.fontScaler,
      focusTrap: this.focusTrap,
      ariaHelper: this.ariaHelper,
      highContrast: this.highContrast,
      dyslexiaFont: this.dyslexiaFont,
      motionReducer: this.motionReducer,
      keyboardNav: this.keyboardNav
    }));
  }
  /**
   * Mount the floating UI panel (call after DOM is ready)
   */
  mount() {
    if (!this._panel) {
      console.warn('A11yToolkit: panel is not initialized. Use mode "panel" or "both".');
      return;
    }
    return this._panel.mount(), console.log("♿ A11yToolkit: panel mounted"), this;
  }
  /**
   * Run a full audit and return results (for developer use)
   */
  audit(t = document.body) {
    const e = this.contrastChecker.run(t), a = this.ariaHelper.scan(t);
    return { contrast: e, aria: a };
  }
  /**
   * Unmount the panel and clean up
   */
  destroy() {
    this._panel && this._panel.unmount(), this.highContrast.disable(), this.dyslexiaFont.remove(), this.fontScaler.reset(), this.motionReducer.restore(), this.keyboardNav.remove(), this.focusTrap.release();
  }
}
export {
  $ as A11yToolkit,
  E as AriaHelper,
  _ as ContrastChecker,
  T as DyslexiaFont,
  w as FocusTrap,
  x as FontScaler,
  C as HighContrast,
  M as KeyboardNav,
  H as MotionReducer
};
