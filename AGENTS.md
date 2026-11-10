<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas de Proyecto: Gran Catador / Bodegón del Catador

Este archivo rige de forma estricta todo el desarrollo en este repositorio.

## 1. Skills Obligatorias Activas
- **UI / UX E-commerce:** `.agents/skills/catador-ecommerce-ui/SKILL.md` (Paleta oficial `#00227B` y `#E07A1F`, Header de 3 niveles, Bento Grid 5 columnas, Deals Countdown Timer).
- **Design Taste Frontend (Anti-Slop Art Direction):** `.agents/skills/design-taste-frontend/SKILL.md` (Dirección de arte sin clichés de IA, tipografía con tracking ajustado y `tabular-nums`, jerarquía por contraste de superficie sin sombras pesadas en reposo, ni cajas de iconos arcoíris).
- **Universal Responsive UI:** `.agents/skills/universal-responsive-ui/SKILL.md` (Diseño omni-dispositivo 320px–1920px+, mobile-first, zero horizontal overflow, touch targets >= 44px, safe areas, bimonetarismo adaptable).
- **Clean & Scalable Architecture:** `.agents/skills/clean-scalable-architecture/SKILL.md` (Sistema de archivos estricto, regla de adaptadores, política de cero código muerto, límite de 180-200 líneas por componente).
- **Browser Automation & Testing:** `.agents/skills/agent-browser/SKILL.md` (Pruebas E2E, accesibilidad y validación en vivo con agent-browser de Vercel Labs).

## 2. Sistema de Archivos y Responsabilidades
- `src/app/`: Rutas, layouts y páginas (`page.tsx`, `layout.tsx`). Prohibido colocar lógica de negocio o componentes complejos aquí.
- `src/app/admin/` & `src/components/admin/`: Panel operativo CMS aislado visualmente mediante **Meta Astryx** (`@astryxdesign/core` + `@astryxdesign/theme-neutral`, `AdminThemeProvider`, `admin-astryx.css`).
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

## 4. Estándares de Conversión UX y Jerarquía Visual (7 Reglas de Oro)
1. **Hero Limpio + Carrusel Destacado:** Prohibido superponer logotipos o imágenes con texto detrás del titular del Hero. El lado derecho del Hero debe presentar un carrusel de 3 a 5 productos destacados/ofertas con botella grande sobre fondo blanco y acción directa.
2. **Tarjetas de Producto Uniformes (`ProductCard`):**
   - Contenedor de imagen de altura fija (`h-44 sm:h-48`), fondo blanco puro (`bg-white`), `object-contain` y padding holgado (`p-4`).
   - Nombre con altura fija de 2 líneas (`h-[40px] sm:h-[44px] line-clamp-2`) para alinear selectores y precios entre filas.
   - Selector `Unidad / Caja` legible (`min-h-[36px] text-xs font-extrabold`); cuando `Caja` no esté disponible, mostrar texto informativo claro.
   - Badges de urgencia cuando queden pocas unidades (`¡Última unidad!`, `¡Últimas X und!`).
   - Botón explícito **`+ Agregar`** en naranja (`#E07A1F`) o contador de cantidad (`- 1 +`).
3. **Secciones Completas y Sin Redundancia:**
   - Ocultar `AlliedBrandsSection` si hay menos de 6 marcas activas (`brands.length < 6`).
   - Categorías rápidas (`QuickCategoriesStrip`) siempre con icono representativo de e-commerce.
   - Una sola barra de beneficios (`TrustValueBar`) con iconos claros; no duplicar las 4 garantías en el `Footer`.
4. **Navegación y Filtros con Pistas de Scroll:**
   - Añadir flechas (`ChevronLeft` / `ChevronRight`) y degradado lateral en barras de pestañas deslizables (`LiveCatalogSection`).
   - Subcategorías (fila 2) visualmente más ligeras que los departamentos principales (fila 1).
   - Un solo estilo de activo en el menú azul (`HeaderNav`), sin pintar enlaces fijos en amarillo.
5. **Tipografía y Contraste (Mínimo 13–14px):**
   - Textos de interfaz, navegación, top bar y footer en `13px–14px` mínimo con alto contraste; `HeaderTopBar` con mayor peso visual para la Tasa BCV.
6. **Jerarquía de Color de Botones:**
   - **Naranja (`#E07A1F`):** Acción principal de compra/conversión (`+ Agregar`, `Comprar`, `Ver Ofertas`, `Carrito`).
   - **Azul (`#00227B`):** Navegación, búsqueda (`Buscar`), departamentos y controles secundarios.
7. **Footer Equilibrado:**
   - Sin alertas naranjas confusas, títulos de columna blancos con alto contraste, mayor espaciado entre bloques y columna izquierda sin espacio muerto.

