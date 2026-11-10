---
name: catador-ecommerce-ui
description: >-
  Sistema de diseño UI/UX de alta densidad, dirección de arte Taste Skill (Anti-Slop), identidad
  de marca, jerarquía cromática de conversión y reglas de negocio bimonetarias para Gran Catador /
  Distribuidora Bodegón del Catador. Utilizar en el desarrollo de vistas, componentes, banners,
  tarjetas de producto, navegación y carritos.
---

# Gran Catador / Distribuidora Bodegón del Catador - UI/UX & Taste Skill System

Manual maestro de diseño visual, dirección de arte **Taste Skill (`design-taste-frontend`)**, auditoría de conversión UX y experiencia de usuario e-commerce para **Gran Catador / Distribuidora Bodegón del Catador**.

---

## 1. Jerarquía Cromática Estricta (Regla de Oro de Conversión vs. Navegación)

Para evitar ambigüedad visual entre botones de navegación y acciones de compra, rige una separación semántica inquebrantable:

1. **Naranja Ámbar (`#E07A1F` / Hover `#C85A08` - `catador-amber`):**
   - **Uso Exclusivo:** Acciones principales de **Conversión y Compra** (`+ Agregar` en tarjetas de producto, `Proceder al Pago`, `Confirmar Pedido`, CTA principal del Hero `Ver Ofertas del Día`, y el disparador principal del Carrito en cabecera).
2. **Azul Rey (`#00227B` / Hover `#0A38A8` - `catador-blue`):**
   - **Uso Exclusivo:** **Navegación, Búsqueda, Filtros y Estructura Secundaria** (botón `Buscar` del header, botón desplegable `Departamentos`, barra de navegación principal, pestañas activas de departamentos y controles secundarios).
3. **Rojo Oferta (`#EF4444` - `catador-discount`) y Ámbar Urgencia:**
   - Exclusivo para badges de porcentaje de descuento (`-15%`) y alertas de escasez real (`¡Última unidad!`, `¡Solo quedan 3!`).
4. **Superficies y Tinta (`#F8FAFC`, `#FFFFFF`, `#0F172A`):**
   - Fondo general en `#F8FAFC` (`slate-50`), tarjetas y escenarios de fotografía de producto en blanco puro `#FFFFFF`, y tinta principal en `#0F172A` (`slate-900`).

---

## 2. Tipografía y Contraste Legible (Mínimo 13px–14px)

1. **Prohibido el micro-texto ilegible (`10px–11px`) en información comercial:**
   - El tamaño mínimo para textos de interfaz, enlaces de navegación, descripciones de categorías, subgrupos, pie de página y metadatos operativos es **`13px–14px`** (`text-[13px] sm:text-sm`).
2. **Contraste Elevado:**
   - Sobre fondos claros (`#FFFFFF` / `#F8FAFC`): usar `text-slate-900` para títulos/precios y `text-slate-600` o `text-slate-700` para textos secundarios (nunca gris pálido `text-slate-400` para datos importantes).
   - Sobre fondos oscuros (`#00227B` / `#0F172A`): usar `text-white` para títulos y `text-slate-200` / `text-blue-100` para textos de soporte.
3. **Precisión Numérica Tabular (`tabular-nums`):**
   - Todo precio (`$ USD` y `Bs. BCV`), tasa BCV, contador regresivo y stock debe usar `tabular-nums`.

---

## 3. Regla Inquebrantable Bimonetaria (USD + VES BCV)

1. **Prohibido mostrar precios en una sola moneda.**
2. **Protagonismo de la Tasa BCV en el Top Bar (`HeaderTopBar`):**
   - La barra superior debe tener altura cómoda (`py-2 sm:py-2.5`), texto legible (`13px–14px`) y destacar la **Tasa BCV Oficial** dentro de un badge de alto contraste para que el comprador la identifique al instante.
3. **Jerarquía en Tarjetas y Carrito:**
   - **Precio en Dólares ($ USD):** Valor principal en `font-black tabular-nums tracking-tight`.
   - **Precio en Bolívares (Bs. / VES):** Debajo en `text-xs sm:text-[13px] font-bold tabular-nums text-slate-600`.
4. **Helper Centralizado:** Utilizar siempre `formatPrices(priceUsd, bcvRate)` de `src/lib/currency.ts`.

---

## 4. Estándares de Componentes Clave (7 Reglas de Auditoría UX)

### 1. Hero Principal (`HeroBanner`)
- **Fondo Limpio sin Texto Superpuesto:** Prohibido colocar logotipos o imágenes con texto (`GRAN CATADOR / SUPERMERCADO Y BODEGÓN`) como marca de agua o fondo detrás del `h1` y subtítulo, ya que ensucia la lectura. Si el banner tiene imagen de fondo con texto o logo, se ignora como fondo del bloque tipográfico o se usa un fondo limpio `#00227B` con fotografía nítida de producto.
- **Carrusel de 3 a 5 Productos Destacados / Ofertas:** En lugar de una tarjeta estática con mucho espacio vacío y botella pequeña, la columna derecha del Hero debe presentar un **carrusel dinámico de 3 a 5 ofertas o productos destacados** con imagen grande sobre fondo blanco, badge de descuento/stock, controles de navegación y botón directo de conversión.

### 2. Tarjetas de Producto (`ProductCard`)
- **Escenario Fotográfico Unificado:** Todas las imágenes deben tener un contenedor de altura uniforme (`h-44 sm:h-48`), fondo blanco puro (`bg-white`), `object-contain` y padding holgado (`p-4`) para que todas las botellas y empaques se vean armónicos y del mismo tamaño visual.
- **Alineación Horizontal Perfecta entre Filas:**
  - El nombre del producto (`h3`) debe tener una **altura fija reservada de 2 líneas** (`h-[40px] sm:h-[44px] line-clamp-2`) para que los selectores y precios nunca queden desalineados entre tarjetas vecinas.
  - La franja del selector `Unidad / Caja` debe mantener una altura constante (`min-h-[36px]`) en todas las tarjetas.
- **Selector Unidad / Caja Claro:** Tamaño legible (`text-xs font-extrabold py-1.5`). Cuando la modalidad por caja no tenga stock suficiente, mostrar claramente el estado deshabilitado o una línea informativa (`Caja xN no disponible`) en lugar de un botón diminuto casi invisible.
- **Badges de Urgencia de Stock:**
  - `stockQuantity === 1`: Badge destacado **`¡Última unidad!`** (`bg-rose-50 text-rose-700 border border-rose-200`).
  - `stockQuantity >= 2 && stockQuantity <= 5`: Badge **`¡Últimas ${stockQuantity} und!`** (`bg-amber-50 text-amber-800 border border-amber-200`).
  - `stockQuantity > 5`: Indicador claro `${stockQuantity} disp.` en `text-emerald-700 font-bold`.
- **Botón de Conversión Explícito (`+ Agregar`):** Prohibido usar un botón pequeño solo con icono de carrito. Usar un botón explícito **`+ Agregar`** en color naranja (`bg-catador-amber hover:bg-catador-amber-dark text-white font-black`) que al agregar se transforma en el selector de cantidad (`-  1  +`).

### 3. Prevención de Secciones Vacías o Redundantes
- **Marcas Aliadas (`AlliedBrandsSection`):** Ocultar automáticamente la sección en la tienda pública si hay **menos de 6 marcas activas** (`brands.length < 6`), evitando mostrar una sola tarjeta gigante aislada.
- **Categorías Rápidas (`QuickCategoriesStrip`):** Cada categoría (Licores, Cervezas, Refrescos, Alimentos, Snacks, Hielo) debe incluir su **icono representativo de e-commerce** dentro de un contenedor limpio de marca junto al título y subtítulo (`13px–14px`).
- **Barra Única de Beneficios con Iconos (`TrustValueBar` vs `Footer`):**
  - En `TrustValueBar`: reemplazar los puntos naranjas decorativos por **iconos vectoriales claros** (`Truck`, `RefreshCw`, `ShieldCheck`, `CreditCard`).
  - En `Footer`: **eliminar la franja superior duplicada de 4 garantías** para que los beneficios aparezcan una sola vez en la página.

### 4. Navegación, Menú y Filtros (`HeaderNav` & `LiveCatalogSection`)
- **Estilo Único de Enlace Activo en `HeaderNav`:** Prohibido pintar "Catálogo Completo" en amarillo fijo mientras los demás enlaces son blancos. Todos los enlaces del menú azul comparten el mismo estilo base (`text-white/90 hover:text-white text-[13px] sm:text-sm`) y solo la ruta activa lleva el indicador activo. El botón `Departamentos` usa azul institucional o borde integrado para respetar la regla de color.
- **Indicadores de Scroll Horizontal (Degradado + Flechas):** En las tiras de departamentos y subcategorías (`LiveCatalogSection`), incluir degradados laterales y **botones de flecha izquierda/derecha (`ChevronLeft` / `ChevronRight`)** para que nunca se corten textos (`JUGO V...`, `SANGRIA`) sin indicar que hay más opciones.
- **Jerarquía de 2 Niveles en Filtros:**
  - *Nivel 1 (Departamentos):* Pestañas principales con cuerpo (`bg-white border border-slate-200`, activo en `bg-catador-blue text-white`).
  - *Nivel 2 (Subcategorías):* Subnivel visualmente más ligero (pestañas tipográficas limpias con línea inferior activa `border-b-2 border-catador-amber text-catador-blue font-black`, sin cajas pesadas que compitan con el Nivel 1).

### 5. Footer de Alto Contraste, Datos Oficiales y Sin Espacio Muerto (`Footer`)
- **Identidad y Sede Única Oficial:** Usar el nombre comercial **`EL CATADOR.`**, favicon oficial (`/icon-catador.png`) y dirección unificada **`C.C. Ciudad Catador Local N1`** (prohibido dejar referencias heredadas como "Av. 23 de Enero" o "Cuatricentenaria").
- **Sin Alertas Falsas ni Promesas No Vigentes:** Prohibido mostrar textos como "Pedidos Gratis Temporalmente Restringidos" o "Pedidos gratis a partir de $30" que no correspondan a la configuración activa en el CMS. Usar exclusivamente información gestionada desde `configuracion_tienda`.
- **Contraste y Espaciado:** Títulos de columna en blanco puro (`text-white text-sm sm:text-base font-black mb-4`), enlaces en `text-slate-300 hover:text-white text-[13px] sm:text-sm`, y separación amplia entre bloques (`gap-10 lg:gap-12`).
- **Columna Izquierda Equilibrada:** Distribuir la información de sede (Logo, Razón Social + RIF, tarjeta compacta de dirección física y teléfono/horario) sin dejar huecos vacíos.

---

## 5. Buscador, Cero Etiquetas IA y Franja de Búsquedas (`HeaderMain`)

- **Política Cero Etiquetas IA:** Prohibido mostrar badges, textos o sugerencias con siglas "IA" en cualquier parte de la tienda pública.
- **Franja Bajo el Buscador (`POPULAR:` / `RECIENTES:`):**
  - Cuando el usuario no tiene historial de búsquedas reciente, mostrar la franja **`POPULAR:`** (en negrita azul `#00227B`) con los accesos directos oficiales: `Buchanan's`, `Santa Teresa 1796`, `Polar Pilsen`, `Corona` y `Harina P.A.N.`.
  - Al registrar búsquedas reales del usuario, conmutar automáticamente a **`RECIENTES:`** permitiendo eliminar términos individuales (`X`) o vaciar el historial (`Limpiar`) para volver a **`POPULAR:`**.

---

## 6. Estándar Visual del Panel CMS (`/admin/*` con Meta Astryx)

- **Aislamiento Estricto:** Todo el panel administrativo bajo `/admin/*` utiliza **Meta Astryx** (`@astryxdesign/core` + `@astryxdesign/theme-neutral`) envuelto en `AdminThemeProvider` (`Theme` + `LayerProvider`), sin inyectar ni alterar estilos de la tienda pública.
- **Personalización de Marca en CMS:** Los tokens de `[data-astryx-theme="neutral"]` se sobrescriben en `src/app/admin/admin-astryx.css` para mantener el acento institucional `#00227B`, fondos limpios `#F8FAFC` / `#FFFFFF` y tipografía `Figtree`.
- **Componentes Obligatorios en CMS:**
  - **Confirmaciones Destructivas:** Usar `AlertDialog` (nunca `window.confirm()` ni `alert()` nativos del navegador).
  - **Modales de Edición / Operación:** Usar `Dialog` + `Layout` + `DialogHeader` + `LayoutContent` + `LayoutFooter` (`EditUserModal`, `ProductConfigModal`, `QuickDeliveryCalculatorModal`, visor de comprobantes).
  - **Pestañas y Filtros:** Usar `SegmentedControl` / `SegmentedControlItem` o `TabList` / `Tab` con scroll horizontal.
  - **Interruptores y Estados:** Usar `Switch` para booleanos, `Badge` para estados de pedidos/usuarios, `Banner` + `useToast()` para retroalimentación inmediata y `EmptyState` cuando no existan registros.
