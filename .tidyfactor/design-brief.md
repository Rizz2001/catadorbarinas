# TidyFactor Design Brief — EL CATADOR. (Gran Catador / Bodegón del Catador)

Generated: 2026-11-11
Project: EL CATADOR. Barinas (catadorbarinas)
Stack: Next.js 16.4 (App Router) + React 19 + Tailwind CSS v4 + Supabase + FoxData (SmartVentas)

## Confirmed Baseline
- **D1 Style Movement**: Luxury Editorial Retail — Opción C (Bodegón Moderno Navy `#0F172A` / `#001754` & Oro Roble `#D99B38` / `#EB9C53` sobre lienzo `#F7F8FA`)
- **D2 Typography Pairing**: Geist Sans (UI & Tabular Metrics) + Editorial Serif Uppercase (Hero Display) con `font-variant-numeric: tabular-nums` obligatorio en precios `$ USD`, `Bs. BCV`, contadores y steppers `- 1 +`
- **D3 Layout Archetype**: Bento Modular Grid (Hero + 4 Bento Cards superpuestas) + N7 Double-Decker Utility Header + Ft8 Sitemap Grid Footer
- **D4 Motion Approach**: Restrained Micro (150ms–200ms) con `active:scale-[0.98]`, `Gliding Arrow Lockup` (`translate-x-0.5` en hover) y respeto estricto a `prefers-reduced-motion`
- **D5 UI Density Scale**: Balanced High-Density Retail (Tarjetas uniformes con escenario blanco puro + `mix-blend-multiply`, botones circulares `+` / `>`, cápsulas `- 1 +` y selector `Unidad | Caja`)

## Selected Component Matrix Patterns (`component-matrix-registry.md`)
- **Eyebrows & Kickers**: `#07 Status Dot Indicator` + `#01 Uppercase Kicker` (prohibido usar bordes laterales `border-l-4` decorativos, Anti-Pattern #7)
- **Cards & Containers**: `#02 Passe-Partout Inset` con escenario fotográfico sin parche gris (`mix-blend-multiply contrast-[1.08] brightness-[1.05]`)
- **Buttons & CTAs**: `#05 Gliding Arrow Lockup` + `#01 Tactile Depress` (`active:scale-[0.98]`) con soporte completo para la matriz de 8 estados (`Default`, `Hover`, `Focus-Visible`, `Active`, `Disabled`, `Loading`, `Empty`, `Error/Success`)
- **Metrics & Stat Counters**: `#01 Superscript Precision Stat` (símbolo `$` y decimales estilizados con `tabular-nums` y contraparte `Bs. BCV`) + `#04 Micro-Bento Stat Box` en `TrustValueBar`

## Stack & Quality Constraints
- **Primary Language**: `es-VE` (Bimonetario permanente `$ USD` + `Bs. BCV`)
- **Token System**: Tailwind CSS v4 `@theme` + CSS Custom Properties en `src/app/globals.css`
- **Pre-Emit Self-Critique Target**: `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

