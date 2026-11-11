<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas de Proyecto: Gran Catador / Bodegón del Catador

Este archivo rige de forma estricta todo el desarrollo en este repositorio.

## 1. Skills Obligatorias Activas
- **UI / UX E-commerce (Opción C + Paleta del Logotipo Oficial):** `.agents/skills/catador-ecommerce-ui/SKILL.md` (Azul oficial del logotipo `#0016C2` / `#00227B`, Navy `#001754` / `#0F172A` y Ámbar Roble del Barril `#EB9C53` / `#E07A1F` / `#B6683E` sobre lienzo `#F7F8FA`, botonería circular `+` / `>`, cápsulas `- 1 +`, Hero Navy con 4 Bento cards superpuestas, Auth Bottom Sheet, Deals Countdown).
- **Design Taste Frontend (Anti-Slop Art Direction):** `.agents/skills/design-taste-frontend/SKILL.md` (Dirección de arte sin clichés de IA, tipografía con tracking ajustado y `tabular-nums`, jerarquía por contraste de superficie sin sombras pesadas en reposo, ni cajas de iconos arcoíris).
- **Universal Responsive UI:** `.agents/skills/universal-responsive-ui/SKILL.md` (Diseño omni-dispositivo 320px–1920px+, mobile-first, zero horizontal overflow, touch targets >= 44px, safe areas, cintillo diagonal móvil y `BottomNav` con indicador en gota).
- **Clean & Scalable Architecture:** `.agents/skills/clean-scalable-architecture/SKILL.md` (Sistema de archivos estricto, regla de adaptadores, política de cero código muerto, límite de 180-200 líneas por componente).
- **Browser Automation & Testing:** `.agents/skills/agent-browser/SKILL.md` (Pruebas E2E, accesibilidad y validación en vivo con agent-browser de Vercel Labs).
- **Superdesign UI & Design System Skill:** `.agents/skills/superdesign/SKILL.md` (Análisis estructural del repositorio en `.superdesign/init/`, extracción de tokens/componentes, auditoría de UI y generación de borradores de diseño de alta fidelidad).
- **TidyFactor Styler (Production UI Polish & Component Matrix Engine):** `.agents/skills/styler/SKILL.md` (Pulido quirúrgico de UI en producción, matriz interactiva de 8 estados, registro de patrones de componentes `component-matrix-registry.md`, barra de calidad anti-clichés `quality-bar.md` y brief de decisiones en `.tidyfactor/design-brief.md`).

## 2. Sistema de Archivos y Responsabilidades
- `src/app/`: Rutas, layouts y páginas (`page.tsx`, `layout.tsx`). Prohibido colocar lógica de negocio o componentes complejos aquí.
- `src/app/admin/` & `src/components/admin/`: Panel operativo CMS aislado visualmente mediante **Meta Astryx** (`@astryxdesign/core` + `@astryxdesign/theme-neutral`, `AdminThemeProvider`, `admin-astryx.css`), armonizado con sidebar Navy (`#0F172A`) y acentos Oro (`#F59E0B`).
- `src/components/ui/`: Primitivas atómicas puras sin lógica comercial para la tienda pública (`Button`, `Badge`, `Skeleton`) sobre Tailwind CSS v4.
- `src/components/layout/`: Estructura global (`Header`, `Footer`, `BottomNav`, `CartDrawer`).
- `src/components/ecommerce/`: Dominio comercial (`ProductCard`, `FeaturedDealsBox`, `CartItemRow`).
- `src/services/` & `src/adapters/`: Data fetching desacoplado con adaptadores que transforman a `src/types/`.
- `src/hooks/`: Lógica interactiva aislada (`useCountdown`, `useDebounce`, `useRecentSearches`).
- `src/store/`: Estado Zustand (`useCartStore`, `useBcvStore`, `useUiStore`, `useStoreConfigStore`).
- `src/lib/` & `src/constants/`: Utilidades (`currency.ts`, `utils.ts`, `delivery.ts`) y configuración (`config.ts`).

## 3. Política de Cero Código Muerto, CMS-First & Calidad
- Eliminar huérfanos inmediatamente (`npx tsc --noEmit --noUnusedLocals --noUnusedParameters` limpio en módulos modificados).
- Prohibido código comentado (`// old code`).
- Cero imports sin usar y cero `console.log()` de depuración.
- Validación obligatoria con `npx next typegen`, `npx tsc --noEmit` y `npm run lint` con **0 errores** (y `npm run build` tras cambios estructurales).
- **100% Configurable vía CMS (`configuracion_tienda`):** Identidad oficial (**`EL CATADOR.`**, sede unificada **`C.C. Ciudad Catador Local N1`**), Tasa BCV, tarifas GPS, métodos de pago (**Pago Móvil, Transferencia Bancaria, Zelle y Efectivo USD**) y bloques de portada administrables desde `/admin`.
- **Cero Etiquetas IA:** Prohibido mostrar badges o menciones a "IA" en la tienda pública; franja del buscador con `POPULAR:` (`Buchanan's`, `Santa Teresa 1796`, `Polar Pilsen`, `Corona`, `Harina P.A.N.`) y `RECIENTES:` reales del usuario.
- Bimonetarismo permanente: todo precio debe renderizar en USD ($) y VES (Bs. BCV).

## 4. Estándares de Conversión UX y Jerarquía Visual (Opción C — Bodegón Moderno Navy & Oro)
1. **Hero Editorial Navy + 4 Bento Cards Superpuestas:** Prohibido superponer logotipos o imágenes con texto detrás del titular del Hero. El Hero presenta fondo Midnight Navy (`#0F172A` / `#001754`) limpio con fotografía nítida y **4 tarjetas blancas Bento superpuestas** en su borde inferior (`Ofertas Especiales` con countdown, `Delivery GPS Barinas`, `Compra por Caja Cerrada` y `Edición Destacada`) usando botones circulares `>`.
2. **Tarjetas de Producto Uniformes (`ProductCard`):**
   - Contenedor de imagen de altura fija (`h-44 sm:h-48`), fondo blanco puro (`bg-white`), `object-contain` y padding holgado (`p-4`).
   - Botón circular flotante **`+`** en Midnight Navy (`#0F172A`) en la esquina superior derecha para agregar en 1 toque; al estar en carrito, mostrar la cápsula sólida **`- 1 +`** (`rounded-full bg-[#0F172A] text-white tabular-nums`).
   - Nombre con altura fija de 2 líneas (`h-[40px] sm:h-[44px] line-clamp-2`) para alinear selectores y precios entre filas.
   - Selector `Unidad | Caja` en píldora legible (`min-h-[36px] text-xs font-extrabold`); cuando `Caja` no esté disponible, mostrar texto informativo claro.
   - Badges dorados (`-15%`, `Caja xN`) y urgencia de stock (`¡Última unidad!`, `¡Últimas X und!`).
3. **Secciones Completas y Sin Redundancia:**
   - Ocultar `AlliedBrandsSection` si hay menos de 6 marcas activas (`brands.length < 6`).
   - Categorías rápidas (`QuickCategoriesStrip`) con iconos circulares en desktop y soporte para tarjetas 2×2 con cintillo diagonal `+` en móvil.
   - Una sola barra de beneficios (`TrustValueBar`) con iconos claros; no duplicar las 4 garantías en el `Footer`.
4. **Navegación, Filtros con Pistas de Scroll & Móvil:**
   - Buscador en píldora (`rounded-full`) en cabecera con chips horizontales en móvil; flechas (`ChevronLeft` / `ChevronRight`) y degradado lateral en barras de pestañas deslizables (`LiveCatalogSection`).
   - Subcategorías (fila 2) visualmente más ligeras que los departamentos principales (fila 1).
   - Un solo estilo de activo en el menú Navy (`HeaderNav`), sin pintar enlaces fijos en amarillo.
   - `BottomNav` móvil con indicador activo en forma de gota (`#0F172A`) y Auth Bottom Sheet antes de pasar al pago si el usuario no está autenticado.
5. **Tipografía y Contraste (Mínimo 13–14px):**
   - Textos de interfaz, navegación, top bar y footer en `13px–14px` mínimo con alto contraste; `HeaderTopBar` / cabecera con píldora dorada visible para la Tasa BCV.
6. **Jerarquía de Color de Botones (Paleta del Logotipo Oficial):**
   - **Azul Oficial del Logo (`#0016C2` / `#00227B` — Hover `#001754`):** Botones primarios de acción y compra (`+` circular, `>` circular, cápsula `- 1 +`, `Agregar al carrito`, `Ir a pagar`, `Iniciar sesión`, navegación activa).
   - **Ámbar Roble del Barril (`#EB9C53` / `#E07A1F` / `#B6683E` — Fondo suave `#FFF4E6` / `#FEF3C7`):** Tasa BCV, badges de descuento (`-15%`), etiquetas `Caja xN`, countdown y destacados de conversión.
7. **Footer Equilibrado:**
   - Fondo `#0F172A` / `#001754`, sin alertas confusas, títulos de columna blancos con alto contraste, mayor espaciado entre bloques y columna izquierda sin espacio muerto.

