# a11y-toolkit

A comprehensive, zero-dependency accessibility toolkit for web apps. Ships as an NPM package with two modes: a **floating UI panel** for end-users and a **developer audit API** for programmatic use.
[![npm version](https://img.shields.io/npm/v/wcag-toolkit.svg)](https://www.npmjs.com/package/wcag-toolkit)
---

## Features

| Module | What it does |
|---|---|
| 🎨 ContrastChecker | Scans DOM for WCAG 2.1 AA contrast violations |
| 🔤 FontScaler | Adjusts root font size (0.8×–2.0×) |
| 🔒 FocusTrap | Traps keyboard focus inside modals/dialogs |
| 🦻 AriaHelper | Detects missing alt, labels, roles — auto-fix option |
| 🌑 HighContrast | High contrast + dark mode (CSS invert) |
| 📖 DyslexiaFont | OpenDyslexic font + improved letter/line spacing |
| 🎞️ MotionReducer | Disables all animations/transitions |
| ⌨️ KeyboardNav | Enhanced focus rings + skip-to-content link |

---

## Installation

```bash
npm install a11y-toolkit
```

---

## Usage

### End-User Panel Mode
Mounts a floating ♿ button that opens an accessible settings panel.

```js
import { A11yToolkit } from 'a11y-toolkit';
import 'a11y-toolkit/dist/a11y-toolkit.css'; // optional — bundled styles

const toolkit = new A11yToolkit({ mode: 'panel' });
toolkit.mount(); // call after DOM is ready
```

### Developer Audit Mode
Use the JS API directly — no UI panel.

```js
import { A11yToolkit } from 'a11y-toolkit';

const toolkit = new A11yToolkit({ mode: 'audit' });

// Run full audit (logs to console)
toolkit.audit();

// Individual modules
toolkit.contrastChecker.run();         // returns { total, violations }
toolkit.ariaHelper.scan();             // returns array of issues
toolkit.ariaHelper.fix(true);          // auto-fix missing ARIA attributes
```

### Both (default)
```js
const toolkit = new A11yToolkit({ mode: 'both' });
toolkit.mount();
```

---

## Individual Module Imports (tree-shakeable)

```js
import { FocusTrap } from 'a11y-toolkit';

const trap = new FocusTrap();
trap.trap(document.querySelector('#modal'));  // trap focus
trap.release();                               // release + restore previous focus
```

```js
import { HighContrast } from 'a11y-toolkit';
const hc = new HighContrast();
hc.enable('highContrast');  // or 'dark'
hc.toggle('dark');
hc.disable();
```

```js
import { FontScaler } from 'a11y-toolkit';
const fs = new FontScaler();
fs.setScale(1.25);   // 125% font size
fs.increase();       // +10%
fs.decrease();       // -10%
fs.reset();
```

```js
import { MotionReducer } from 'a11y-toolkit';
const mr = new MotionReducer();
mr.autoDetect();     // respects prefers-reduced-motion
mr.reduce();
mr.restore();
```

```js
import { KeyboardNav } from 'a11y-toolkit';
const kn = new KeyboardNav();
kn.highlight();      // enhanced focus rings + skip link
kn.remove();
```

```js
import { DyslexiaFont } from 'a11y-toolkit';
const df = new DyslexiaFont();
df.apply();   // OpenDyslexic + spacing
df.remove();
df.toggle();
```

---

## Options

```js
new A11yToolkit({
  mode: 'both',            // 'panel' | 'audit' | 'both'
  autoDetectMotion: true,  // auto-apply reduced motion if OS prefers it
});
```

---

## Cleanup

```js
toolkit.destroy(); // removes panel, resets all styles
```

---

## Dev Setup

```bash
git clone <repo>
cd a11y-toolkit
npm install
npm run dev       # start dev server with demo page
npm run build     # build to /dist
```

---

## WCAG Compliance

This toolkit helps achieve **WCAG 2.1 Level AA** compliance by addressing:
- **1.4.3** Contrast (Minimum)
- **1.4.4** Resize Text
- **1.4.10** Reflow
- **2.1.1** Keyboard
- **2.4.3** Focus Order
- **2.4.7** Focus Visible
- **3.3.2** Labels or Instructions
- **4.1.2** Name, Role, Value

---

## License

MIT
