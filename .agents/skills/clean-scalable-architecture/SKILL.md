---
name: clean-scalable-architecture
description: >-
  Estándares obligatorios de Clean Architecture, modularidad, separación de responsabilidades,
  patrón adaptador para FoxData (SmartVentas) y política de cero código muerto en Next.js y TypeScript.
  Utilizar en cada tarea de creación, refactorización, depuración o revisión de código.
---

# Clean & Scalable Architecture - Gran Catador (EL CATADOR.)

Guía arquitectónica y de ingeniería de software obligatoria para **Gran Catador / Distribuidora Bodegón del Catador** (`EL CATADOR.`).

---

## 1. Stack Tecnológico & Convenciones
- **Framework:** Next.js 16+ con App Router y Turbopack estricto (`src/app/`), React 19+.
- **Lenguaje:** TypeScript estricto. **Prohibido el uso de `any`**. Toda respuesta de backend y estado debe poseer contratos claros de interfaz en `src/types/`.
- **Estilos Híbridos (Tienda vs. CMS — Paleta del Logotipo EL CATADOR.):**
  - **Tienda Pública:** Tailwind CSS v4 puro en `src/app/globals.css` con tokens semánticos extraídos del logotipo oficial (**Azul Oficial `#0016C2` / `#00227B`**, **Navy Profundo `#001754`**, **Ámbar Roble del Barril `#EB9C53` / `#E07A1F` / `#B6683E`**, **Lienzo `#F7F8FA`**, **Tarjetas `#FFFFFF`**, **Bordes `#E2E8F0`**), `clsx` y `tailwind-merge` mediante `cn(...)` en `src/lib/utils.ts`.
  - **Panel CMS (`/admin/*`):** **Meta Astryx** (`@astryxdesign/core` + `@astryxdesign/theme-neutral`) aislado estrictamente dentro de `src/app/admin/layout.tsx` vía `AdminThemeProvider` y `src/app/admin/admin-astryx.css` (`@scope`), alineando su sidebar a Navy Profundo (`#001754` / `#0F172A`) y acentos del logo (`#0016C2` / `#EB9C53`) sin colisionar ni filtrar CSS hacia la tienda pública, respetando el orden `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;` declarado en `src/app/globals.css`.
- **Regla Cero Hardcodeo (100% Configurable desde CMS):** Todo dato operativo y de marca (nombre comercial `EL CATADOR.`, sede `C.C. Ciudad Catador Local N1`, tasas BCV, tarifas delivery GPS, cuentas receptoras de Pago Móvil, Transferencias Bancarias y Zelle, secciones y textos legales/footer) reside en Supabase (`configuracion_tienda`) y se consume vía `useStoreConfigStore`.
- **Estado Global:** Zustand con persistencia en `localStorage` (`useCartStore`, `useBcvStore`, `useUiStore`, `useStoreConfigStore`, `useWishlistStore` en `src/store/`).
- **Iconografía:** `lucide-react`.

---

## 2. Server Components vs. Client Components ('use client')
- **Server Components (RSC) por Defecto:** Todas las páginas (`page.tsx`), layouts y contenedores que realizan data fetching asíncrono (`async/await` con revalidación ISR/SSR) son Server Components.
- **Uso Estrictamente Restringido de `'use client'`:** Reservado únicamente a las hojas interactivas de la aplicación:
  - Botones circulares `+` de compra rápida, cápsulas `- 1 +` y selector `Unidad | Caja`.
  - Barra de búsqueda interactiva en píldora con debounce (`POPULAR` / `RECIENTES`).
  - Filtros de grupos, subgrupos y pestañas de tendencias.
  - Drawers deslizables (`CartDrawer`), Auth Bottom Sheet y navegación móvil (`BottomNav`).
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
- **Máximo 200 líneas de código:** Ningún archivo de componente (`.tsx`) debe exceder las **180-200 líneas**. Si un componente crece durante el rediseño visual, debe dividirse inmediatamente en sub-componentes atómicos en su carpeta respectiva (por ejemplo, separar `HeroBentoCards`, `ProductDetailBuyBox`, `CheckoutAuthBottomSheet`, `CategoryDiagonalCard`).
- **Separación Vista-Lógica:** Si un componente de cliente acumula más de 3 estados (`useState`) o lógica de efectos compleja, debe extraerse a un Custom Hook en `src/hooks/`.

---

## 5. Protocolo Estricto de "Cero Código Muerto" (Zero Dead Code)
Obligatorio en cada fase del rediseño y en cualquier refactorización:
1. **Eliminación Inmediata de Huérfanos:** Al reemplazar componentes, layouts, tokens CSS viejos (por ejemplo, variables/clases heredadas sin uso tras migrar a Opción C), helpers o tipos que queden sin consumidores, **eliminarlos en el mismo cambio** — nunca dejar archivos `Old*.tsx` o tokens duplicados.
2. **Cero Código Comentado:** Prohibido dejar bloques de código antiguo comentado (`// old code`, `{/* legacy */}`). Git resguarda el historial.
3. **Limpieza de Imports y Depuración:** Remover `imports` no leídos, props obsoletas, variables sin uso y cualquier `console.log()` de depuración, verificando con:
   ```powershell
   npx tsc --noEmit --noUnusedLocals --noUnusedParameters
   ```
4. **Verificación Continua:** Tras cada bloque de cambios, ejecutar `npx next typegen`, `npx tsc --noEmit` y `npm run lint` con **0 errores**, más `npm run build` tras cambios estructurales o de layout.
