# Superdesign Theme & Design Tokens — EL CATADOR. (Opción C — Bodegón Moderno Navy & Oro)

## Part 1 — Compact Token Summary

### Color Palette (`:root` & `@theme`)
- `--color-catador-blue` / `--primary-catador`: `#0F172A` (Midnight Navy — Primary CTA, `+` circular buttons, `- 1 +` pill steppers, active tabs)
- `--color-catador-blue-dark` / `--primary-dark`: `#001754` (Deep Royal Navy — Footer, HeaderNav accent, Hover states)
- `--color-catador-blue-vivid` / `--primary-vivid`: `#0016C2` (Official Logo Blue — Brand mark accent)
- `--color-catador-amber` / `--accent-amber`: `#E07A1F` (Warm Amber Conversion CTA)
- `--color-catador-amber-oak` / `--accent-oak`: `#EB9C53` (Oak Gold — BCV pill, `-15%` & `Caja xN` badges, countdown highlights)
- `--color-catador-amber-dark` / `--accent-amber-dark`: `#B6683E` (Aged Barrel Bronze)
- `--color-catador-amber-soft` / `--accent-amber-soft`: `#FEF3C7` (Soft Gold Surface)
- `--color-catador-bg` / `--surface-bg`: `#F7F8FA` (Main Storefront Canvas)
- `--color-catador-card` / `--surface-card`: `#FFFFFF` (Pure White Card Surface)
- `--color-catador-border` / `--surface-border`: `#E2E8F0` (Subtle 1px Hairline Border)

### Typography & Numeric Discipline
- **Sans Family:** Geist Sans / Inter (`-0.025em` heading tracking, minimum `13px–14px` UI copy)
- **Editorial Display (Hero):** Serif uppercase (`clamp(1.65rem, 4vw, 3.1rem)`)
- **Numeric Alignment:** `font-variant-numeric: tabular-nums` mandatory on all USD ($), VES (Bs. BCV), countdown timers, and `- 1 +` steppers.

### Radius & Geometry
- **Cards & Sections:** `rounded-2xl` (`16px`) for ProductCards and Bento cards; `rounded-3xl` (`24px`) for Hero & main containers.
- **Interactive Controls:** `rounded-full` (`9999px`) for search bar, `+` and `>` circular buttons (`36px–40px`), `- 1 +` steppers, and `Unidad | Caja` segmented pills.

---

## Part 2 — Raw Source (`src/app/globals.css`)

```css
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import "tailwindcss";

@custom-variant xs (@media (min-width: 480px));

@theme {
  --color-catador-blue: #0F172A;
  --color-catador-blue-vivid: #0016C2;
  --color-catador-blue-light: #1E293B;
  --color-catador-blue-dark: #001754;
  --color-catador-navy: #0F172A;

  --color-catador-amber: #E07A1F;
  --color-catador-amber-oak: #EB9C53;
  --color-catador-amber-dark: #B6683E;
  --color-catador-amber-soft: #FEF3C7;
  --color-catador-amber-light: #FFF7ED;

  --color-catador-discount: #EF4444;
  --color-catador-discount-bg: #FEF2F2;

  --color-catador-bg: #F7F8FA;
  --color-catador-card: #FFFFFF;
  --color-catador-border: #E2E8F0;
}

:root {
  --primary-catador: #0F172A;
  --primary-vivid: #0016C2;
  --primary-light: #1E293B;
  --primary-dark: #001754;
  --accent-amber: #E07A1F;
  --accent-oak: #EB9C53;
  --accent-amber-dark: #B6683E;
  --accent-amber-soft: #FEF3C7;
  --accent-amber-light: #FFF7ED;
  --surface-bg: #F7F8FA;
  --surface-card: #FFFFFF;
  --surface-border: #E2E8F0;
  --foreground: #0F172A;
  --background: #F7F8FA;
}
```

