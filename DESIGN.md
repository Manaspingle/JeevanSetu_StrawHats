# JeevanSetu — UI/UX Design System Specification

## 1. Design Intent & Philosophy
JeevanSetu is an **action-first** clinical blood bank, hospital transfusion, and voluntary donor platform. Unlike traditional directories that force users into search-first loops, JeevanSetu emphasizes three direct primary intents:
1. **Request & Reserve**: Immediate emergency blood request with auto-routing.
2. **Donate & Verify**: Donor self-service with ID verification and eligibility countdown.
3. **Inventory & Shelf Control**: Blood bank unit intake with FEFO dispatch order.

---

## 2. Design Tokens Architecture
All design tokens are declared once in `src/styles/tokens.css` using CSS custom properties. No arbitrary hex codes are hardcoded into components.

### Theme A (Default): "Life & Care"
```css
--color-primary: #C8102E;        /* brand crimson, buttons, primary actions */
--color-primary-hover: #A80D26;  /* dark crimson hover state */
--color-navy: #12263F;           /* dark navy: headings, nav, body text */
--color-bg: #F6F8FA;             /* soft background */
--color-surface: #FFFFFF;        /* card surface */
--color-border: #D8DFE6;         /* subtle 1px container border */
--color-success-fill: #1F9D6B;   /* badges/fills only */
--color-success-text: #137A52;   /* text on white (4.5:1+ contrast) */
--color-warning-fill: #F5A524;   /* warning fill, always paired with dark navy */
--color-warning-text: #8A5A00;   /* accessible text on white */
--color-danger: #B42318;         /* errors & expired units */
```

### Theme B: "Clinical Trust" (`[data-theme="clinical"]`)
```css
[data-theme="clinical"] {
  --color-primary: #0F4C81;      /* deep clinical blue */
  --color-primary-hover: #0B3A63;
  --color-accent: #1AA6B7;       /* cyan accent for borders & charts only */
  --color-navy: #0B1F33;
  --color-bg: #F5F9FC;
  --color-danger: #E5484D;
}
```

---

## 3. WCAG 2.2 AA Contrast & Accessibility Compliance
1. **Body Text**: Contrast ratio $\ge 4.5:1$ against background.
2. **Interactive Elements & Large Headings**: Contrast ratio $\ge 3:1$.
3. **Status Badges (Never Color-Only)**:
   Every status pairs **Color + Icon + Text Label**:
   - **Available**: Green fill/border + `CheckCircle2` icon + `"Available"` text.
   - **Low Stock**: Amber fill/border + `AlertTriangle` icon + `"Low Stock"` text.
   - **Critical**: Crimson fill/border + `AlertOctagon` icon + `"Critical"` text.
   - **Expiring in $\le$3 Days**: Orange fill/border + `Clock` icon + `"Expiring in ≤3d"` text.
   - **Quarantined / Expired**: Red fill/border + `XCircle` icon + `"Quarantined"` text.
4. **Touch Targets**: Minimum $44 \times 44\text{ px}$ for all buttons, chips, and toggles.
5. **Keyboard Focus Ring**: Distinct 3px navy outline with 2px white offset (`--focus-ring`).
6. **Screen Reader Live Regions**: ARIA-live polite announcements on request updates and allocations.

---

## 4. Four Core Role Dashboards
- **Donor Dashboard** (`/donor`): Availability toggle, ID verification progress stepper, nearby urgent blood requests, donation history.
- **Hospital Dashboard** (`/hospital`): Emergency Request form, blood group chips (radio semantics), units stepper, live tracker timeline (Requested > Matched > Reserved > In Transit).
- **Blood Bank Dashboard** (`/bank`): 8 blood group stock cards with FEFO indicators, expiring-soon queue, quarantine modal with reason audit.
- **Admin Dashboard** (`/admin`): System governance, fraud verification audit logs, pure domain test status, and Concurrency Race Demo.
