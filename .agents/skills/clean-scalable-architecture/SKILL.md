---
name: clean-scalable-architecture
description: >-
  Estándares obligatorios de Clean Architecture, modularidad, separación de responsabilidades,
  patrón adaptador para FoxData (SmartVentas) y política de cero código muerto en Next.js y TypeScript.
  Utilizar en cada tarea de creación, refactorización, depuración o revisión de código.
---

# Clean & Scalable Architecture - Gran Catador

Guía arquitectónica y de ingeniería de software obligatoria para **Gran Catador / Distribuidora Bodegón del Catador**.

---

## 1. Stack Tecnológico & Convenciones
- **Framework:** Next.js 16+ con App Router y Turbopack estricto (`src/app/`), React 19+.
- **Lenguaje:** TypeScript estricto. **Prohibido el uso de `any`**. Toda respuesta de backend y estado debe poseer contratos claros de interfaz en `src/types/`.
- **Estilos Híbridos (Tienda vs. CMS):**
  - **Tienda Pública:** Tailwind CSS v4 puro en `src/app/globals.css` con tokens semánticos de marca (`#00227B`, `#E07A1F`), `clsx` y `tailwind-merge` mediante `cn(...)` en `src/lib/utils.ts`.
  - **Panel CMS (`/admin/*`):** **Meta Astryx** (`@astryxdesign/core` + `@astryxdesign/theme-neutral`) aislado estrictamente dentro de `src/app/admin/layout.tsx` vía `AdminThemeProvider` y `src/app/admin/admin-astryx.css` (`@scope`), respetando el orden `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;` declarado en `src/app/globals.css` para que nunca colisione ni filtre CSS hacia la tienda pública.
- **Regla Cero Hardcodeo (100% Configurable desde CMS):** Todo dato operativo y de marca (nombre comercial `EL CATADOR.`, sede `C.C. Ciudad Catador Local N1`, tasas BCV, tarifas delivery GPS, cuentas receptoras de Pago Móvil, Transferencias Bancarias y Zelle, secciones y textos legales/footer) reside en Supabase (`configuracion_tienda`) y se consume vía `useStoreConfigStore`.
- **Estado Global:** Zustand con persistencia en `localStorage` (`useCartStore`, `useBcvStore`, `useUiStore`, `useStoreConfigStore` en `src/store/`).
- **Iconografía:** `lucide-react`.

---

## 2. Server Components vs. Client Components ('use client')
- **Server Components (RSC) por Defecto:** Todas las páginas (`page.tsx`), layouts y contenedores que realizan data fetching asíncrono (`async/await` con revalidación ISR/SSR) son Server Components.
- **Uso Estrictamente Restringido de `'use client'`:** Reservado únicamente a las hojas interactivas de la aplicación:
  - Botones de acción del carrito y contadores de cantidad.
  - Barra de búsqueda interactiva en vivo con debounce.
  - Filtros de grupos, subgrupos y pestañas de tendencias.
  - Drawers deslizables (`CartDrawer`, menús móviles).
  - Temporizador dinámico de ofertas (`CountdownTimer`).

---

## 3. Patrón Adaptador Obligatorio (`src/adapters/foxdata.adapter.ts`)
**Ningún componente visual ni página puede leer las propiedades crudas del JSON emitido por FoxData (SmartVentas) o APIs externas.**

- Todo payload externo proveniente de los endpoints de productos, inventario, precios y depósitos debe consumirse a través de `src/services/` y transformarse inmediatamente mediante `src/adapters/foxdata.adapter.ts`.
- El adaptador se encarga de:
  1. Mapear claves externas (ej. códigos de depósito, campos de precio, listas de stock) a las interfaces canónicas de `src/types/`.
  2. Filtrar inventario por el depósito del bodegón (`FOXDATA_DEPOSITO_BODEGON=01`).
  3. Sanitizar valores nulos, cadenas vacías y asignar la imagen de fallback oficial `IMAGE_FALLBACKS.product` a todo producto sin fotografía.

---

## 4. Regla de Modularidad y Límite de Tamaño
- **Máximo 200 líneas de código:** Ningún archivo de componente (`.tsx`) debe exceder las **180-200 líneas**. Si un componente se aproxima a este límite, debe dividirse inmediatamente en sub-componentes atómicos en su carpeta respectiva.
- **Separación Vista-Lógica:** Si un componente de cliente acumula más de 3 estados (`useState`) o lógica de efectos compleja, debe extraerse a un Custom Hook en `src/hooks/` (ej. `useCountdown`, `useLiveSearch`, `useCart`).

---

## 5. Protocolo de "Cero Código Muerto" (Zero Dead Code)
En cada modificación, actualización o refactorización:
1. **Eliminación Inmediata de Huérfanos:** Eliminar cualquier archivo, función, tipo o hook que quede sin uso tras un cambio.
2. **Cero Código Comentado:** No dejar bloques de código muerto o comentado (`// old code`). Git resguarda el historial.
3. **Limpieza de Imports y Depuración:** Remover `imports` no leídos, variables no usadas y cualquier `console.log()` temporal de depuración (`npx tsc --noEmit --noUnusedLocals --noUnusedParameters` en los archivos modificados).
4. **Verificación Continua de Tipos y Compilación:** Ejecutar `npx next typegen`, `npx tsc --noEmit` y `npm run lint` con **0 errores**, y `npm run build` tras cambios estructurales o de dependencias.
