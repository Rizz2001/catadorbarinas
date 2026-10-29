<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas de Proyecto: Gran Catador / Bodegón del Catador

Este archivo rige de forma estricta todo el desarrollo en este repositorio.

## 1. Skills Obligatorias Activas
- **UI / UX E-commerce:** `.agents/skills/catador-ecommerce-ui/SKILL.md` (Paleta oficial `#00227B` y `#E07A1F`, Header de 3 niveles, Bento Grid 5 columnas, Deals Countdown Timer).
- **Universal Responsive UI:** `.agents/skills/universal-responsive-ui/SKILL.md` (Diseño omni-dispositivo 320px–1920px+, mobile-first, zero horizontal overflow, touch targets >= 44px, safe areas, bimonetarismo adaptable).
- **Clean & Scalable Architecture:** `.agents/skills/clean-scalable-architecture/SKILL.md` (Sistema de archivos estricto, regla de adaptadores, política de cero código muerto, límite de 180-200 líneas por componente).
- **Browser Automation & Testing:** `.agents/skills/agent-browser/SKILL.md` (Pruebas E2E, accesibilidad y validación en vivo con agent-browser de Vercel Labs).

## 2. Sistema de Archivos y Responsabilidades
- `src/app/`: Rutas, layouts y páginas (`page.tsx`, `layout.tsx`). Prohibido colocar lógica de negocio o componentes complejos aquí.
- `src/components/ui/`: Primitivas atómicas puras sin lógica comercial (`Button`, `Badge`, `Skeleton`).
- `src/components/layout/`: Estructura global (`Header`, `Footer`, `BottomNav`, `CartDrawer`).
- `src/components/ecommerce/`: Dominio comercial (`ProductCard`, `FeaturedDealsBox`, `CartItemRow`).
- `src/services/` & `src/adapters/`: Data fetching desacoplado con adaptadores que transforman a `src/types/`.
- `src/hooks/`: Lógica interactiva aislada (`useCountdown`, `useDebounce`).
- `src/store/`: Estado Zustand (`useCartStore`, `useBcvStore`, `useUiStore`).
- `src/lib/` & `src/constants/`: Utilidades (`currency.ts`, `utils.ts`) y configuración (`config.ts`).

## 3. Política de Cero Código Muerto & Calidad
- Eliminar huérfanos inmediatamente.
- Prohibido código comentado (`// old code`).
- Cero imports sin usar y cero `console.log()` de depuración.
- Validación obligatoria con `npx tsc --noEmit` con 0 errores.
- Bimonetarismo permanente: todo precio debe renderizar en USD ($) y VES (Bs. BCV).

