---
name: catador-ecommerce-ui
description: >-
  Sistema de diseño UI/UX de alta densidad, dirección de arte Taste Skill (Anti-Slop), identidad
  de marca Opción C (Bodegón Moderno Navy & Oro), jerarquía cromática y reglas de negocio bimonetarias
  para EL CATADOR. (Gran Catador / Distribuidora Bodegón del Catador). Utilizar en el desarrollo de
  vistas, componentes, banners, tarjetas de producto, navegación, checkout, perfil y carritos.
---

# EL CATADOR. — Sistema de Diseño UI/UX (Opción C: Bodegón Moderno Navy & Oro)

Manual maestro de diseño visual, botonería retail moderna (cápsulas, acciones circulares `+` / `>`, cintillos diagonales y bottom sheet), auditoría de conversión UX y experiencia bimonetaria para **EL CATADOR.** en Barinas, Venezuela.

---

## 1. Paleta Oficial del Logotipo y Jerarquía Cromática (Opción C — Bodegón Moderno)

La paleta oficial proviene directamente del logotipo oficial de **GRAN CATADOR / EL CATADOR.** (`public/icon-catador.png` y `public/logo-catador.svg`), aplicada sobre el diseño limpio de Opción C:

1. **Azul Oficial del Logotipo (`#0016C2` / `#00227B` — Hover `#001754` / `#0A38A8`):**
   - **Uso Principal:** Botones de acción primaria (`Agregar al carrito`, `Ir a pagar`, `Iniciar sesión`, `Crear cuenta`), **botones circulares `+` de compra rápida** en tarjetas, **botones circulares `>`** de navegación, **cápsulas stepper `- 1 +`**, barra de subnavegación (`HeaderNav`), pestaña activa de departamento, indicador en gota activo en `BottomNav`, y acentos del Hero / Footer (`#001754` Navy profundo para legibilidad editorial).
2. **Ámbar Roble del Barril (`#EB9C53` / `#E07A1F` / `#B6683E` — Fondos `#FFF4E6` / `#FEF3C7` / Texto `#8B3E03`):**
   - **Uso Exclusivo de Destaque y Valor:** Badge **Tasa BCV en vivo** (`Tasa BCV: Bs. ...`), píldoras de porcentaje de descuento (`-15%`, `-20%`), etiquetas **`Caja xN`** (`Solo Caja x24`), cajas del temporizador regresivo (`Ofertas del Día`), y estado activo/destacado en CMS.
3. **Superficies y Tinta (`#F7F8FA`, `#FFFFFF`, `#E2E8F0`, `#0F172A`):**
   - **Lienzo general:** `#F7F8FA` (gris frío ultralimpio).
   - **Tarjetas y escenarios fotográficos:** Blanco puro `#FFFFFF` con radios generosos (`rounded-2xl` / `16px–20px`) y bordes sutiles `1px` (`#E2E8F0`) sin sombras pesadas en reposo.
   - **Tinta:** `#0F172A` (`#0A0B0C` de los aros del barril) para títulos/precios y `#475569` / `#64748B` para metadatos secundarios.
4. **Estados Semánticos:**
   - **Esmeralda (`#10B981` / `#DCFCE7` / `#166534`):** Línea de ahorro en carrito, stock disponible (`+5 disp.`), correo confirmado y pago verificado / pedido entregado.
   - **Rojo (`#EF4444` / `#FEF2F2` / `#991B1B`):** Exclusivo para badges numéricos en notificaciones/carrito y alertas críticas (`¡Últimas X und!`, `Agotado`, errores de formulario).

---

## 2. Tipografía y Contraste Legible (Mínimo 13px–14px)

1. **Tamaño mínimo comercial (`13px–14px`):**
   - Textos de interfaz, enlaces de navegación, etiquetas de filtros, descripciones de categorías y pie de página usan `13px–14px` (`text-[13px] sm:text-sm`) con alto contraste.
2. **Precisión Numérica Tabular (`tabular-nums`):**
   - Todo precio (`$ USD` y `Bs. BCV`), tasa BCV, contador regresivo, stock y cantidades en steppers usan `tabular-nums`.

---

## 3. Regla Inquebrantable Bimonetaria (USD + VES BCV)

1. **Prohibido mostrar precios en una sola moneda.**
2. **Protagonismo de la Tasa BCV (`HeaderTopBar` / `HeaderMain`):**
   - Mostrar la **Tasa BCV Oficial** en una píldora dorada (`bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E]`) o de alto contraste en el header, con botón de refresco manual.
3. **Jerarquía en Tarjetas y Carrito:**
   - **Precio USD:** `text-base sm:text-lg font-black text-[#0F172A] tabular-nums`.
   - **Precio Bs. BCV:** `text-xs sm:text-[13px] font-bold text-slate-600 tabular-nums`.
4. **Helper Centralizado:** Utilizar siempre `formatPrices(priceUsd, bcvRate)` de `src/lib/currency.ts`.

---

## 4. Lenguaje de Botones, Microinteracciones y Componentes Clave

### A. Botonería y Controles del Nuevo Sistema
1. **Botón Circular Flotante `+` (`ProductCard` y Combos):**
   - Ubicado en la **esquina superior derecha** de la tarjeta de producto (`h-9 w-9` visual con área táctil `>= 44px` via hitbox/padding, `rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white`).
   - Agrega el producto en 1 toque respetando la modalidad activa (`Unidad` o `Caja`).
2. **Cápsula Stepper `- 1 +`:**
   - Cuando el producto ya está en el carrito (o dentro de filas del carrito / compra rápida), se renderiza la cápsula sólida **`rounded-full bg-[#0F172A] text-white font-extrabold tabular-nums`** con controles `-`, cantidad centrada y `+`.
3. **Botón Circular `>` (Explorar Oferta / Categoría):**
   - Esquina superior derecha de tarjetas promocionales/ofertas para navegar al departamento o ficha.
4. **Buscador en Píldora (`HeaderMain`):**
   - Campo `rounded-full` con fondo `#F1F5F9` / `#F8FAFC`, lupa inicial y botón circular/píldora Navy, con desplegable inteligente de **`POPULAR:`** (`Buchanan's`, `Santa Teresa 1796`, `Polar Pilsen`, `Corona`, `Harina P.A.N.`) y **`RECIENTES:`** reales del usuario (**Cero Etiquetas IA**).
5. **Chips Horizontales con Icono Circular (Móvil y Catálogo):**
   - Píldoras deslizables con borde fino e icono circular izquierdo (`Tasa BCV`, `Delivery GPS`, `Por Caja`, `Ofertas`).

### B. Portada Principal (`/`)
1. **Header Limpio de 3 Niveles:**
   - Barra superior sutil (`C.C. Ciudad Catador Local N1 · Barinas` + teléfono) + Cabecera blanca (`EL CATADOR.`, píldora `Tasa BCV` dorada, buscador en píldora, Mi Cuenta, Favoritos y Carrito) + Sub-barra de navegación en Midnight Navy (`#0F172A` / `#001754`) con estilo único de ruta activa (sin pintar enlaces fijos en amarillo).
2. **Hero Editorial Navy + 4 Tarjetas Bento Superpuestas:**
   - Banner principal en Midnight Navy (`#0F172A` / `#001754`) con titular limpio de 2 líneas máximo, fotografía nítida de botellas/cava sin marcas de agua ni textos detrás del `h1`, y **4 tarjetas Bento blancas (`rounded-2xl`) superpuestas en su borde inferior**:
     1. *Ofertas Especiales* con countdown regresivo tabular y badge dorado.
     2. *Delivery GPS Barinas* con botón Navy `Calcular tarifa`.
     3. *Compra por Caja Cerrada* con botón circular `>` Navy.
     4. *Edición Destacada* (producto estrella del día) con foto y botón circular `>`.
3. **Tira Circular de Categorías + Ofertas + Tendencias + Catálogo en Vivo:**
   - `QuickCategoriesStrip` con iconos circulares limpios; `FeaturedDealsBox`; `WeeklyTrendsBento`; `AlliedBrandsSection` (oculta si `brands.length < 6`); `LiveCatalogSection` con **flechas de scroll (`ChevronLeft`/`ChevronRight`) + degradado lateral** y jerarquía visual de 2 niveles (Nivel 1 pill solid/navy; Nivel 2 subcategorías ligeras con borde inferior).
4. **Tarjetas de Categoría 2×2 en Móvil con Cintillo Diagonal `+`:**
   - En vistas móviles de categorías/portada: tarjetas blancas cuadradas con foto limpia centrada, barra inferior de color por departamento y pestaña diagonal con `+` blanco en la esquina inferior derecha.
5. **Footer Unificado y Sin Redundancias:**
   - Fondo `#0F172A` / `#001754`, títulos blancos de alto contraste, sede **`C.C. Ciudad Catador Local N1`**, métodos de pago reales (`Pago Móvil`, `Transferencia Bancaria`, `Zelle`, `Efectivo USD`) y sin duplicar las 4 garantías de `TrustValueBar`.

### C. Navegación Móvil (`BottomNav`) y Auth Bottom Sheet
1. **`BottomNav` (5 pestañas: `Inicio`, `Catálogo`, `Ofertas`, `Carrito`, `Mi Cuenta`):**
   - El tab activo se resalta dentro de una **insignia en gota** (`rounded-[14px_14px_14px_4px] bg-[#0F172A] text-white`).
   - El tab `Carrito` incluye badge numérico en rojo/ámbar y convive con la barra flotante de resumen rápido cuando hay artículos.
2. **Auth Bottom Sheet (`CartDrawer` / `/carrito`):**
   - Si el usuario intenta pasar a `/checkout` sin sesión activa, presentar un **Bottom Sheet redondeado (`rounded-t-3xl`)** limpio con icono de perfil, título `"Regístrate o inicia sesión"`, subtítulo contextual de delivery GPS, botón full-width `#0F172A` `"Iniciar sesión"` y enlace secundario `"Cancelar"`.

### D. Vistas Internas (PDP, Auth, Perfil, Checkout & Tracking)
1. **Ficha de Producto (`/producto/[id]`):**
   - Desktop en 3 columnas: galería con miniaturas izquierda | título, SKU, selector píldora `Unidad (1 und) | Caja Cerrada`, badge urgencia y tabla técnica al centro | *Sticky Buy Box* bimonetaria con stepper `- 1 +`, botón `Agregar al carrito` `#0F172A` y métodos de pago a la derecha.
   - Bloque inferior combinado: **Mapa cobertura GPS Barinas** + carrusel **`Completa tu combo`** con botones circulares `+`.
2. **Auth (`/login`, `/registro`, `/recuperar-clave`):**
   - Tarjeta limpia centrada sobre `#F7F8FA` con inputs en píldora, selector segmentado `V | E | J | G` para Cédula/RIF, botón dorado/navy `Detectar ubicación GPS` y botones primarios `#0F172A`.
3. **Dashboard de Perfil (`/cuenta` y `/cuenta/pedidos`):**
   - `AccountHero` con avatar Navy con anillo dorado y badge de verificación, 3 tarjetas métricas (`Pedidos Activos`, `Pedidos Totales`, `Zona GPS`), tabs en píldora (`Mis Pedidos`, `Mi Perfil y GPS`, `Seguridad`), historial de órdenes y mapa GPS.
4. **Checkout 4 Pasos (`/checkout`) y Tracking en Vivo (`/pedidos/[id]`):**
   - Stepper horizontal en píldora/pasos (`Datos y GPS` → `Método de Pago` → `Resumen` → `Chat en Vivo`), tarjetas de métodos locales, resumen con línea verde de ahorro, y tracker en vivo con chat integrado.

---

## 5. Estándar Visual del Panel CMS (`/admin/*` con Meta Astryx)

- **Aislamiento Estricto:** Todo el panel administrativo bajo `/admin/*` mantiene **Meta Astryx** (`@astryxdesign/core` + `@astryxdesign/theme-neutral`) envuelto en `AdminThemeProvider` (`Theme` + `LayerProvider`) y encapsulado mediante `@scope` en `src/app/admin/admin-astryx.css`.
- **Armonía Visual con Opción C:**
  - Sidebar en Deep Midnight Navy (`#0F172A`) con emblema dorado `EC` (`#F59E0B`), ítem activo con acento oro (`rgba(245,158,11,0.16)` y borde `#F59E0B`), y lienzo de trabajo en `#F7F8FA` / `#FFFFFF`.
  - Mantener siempre componentes nativos de Meta Astryx (`AlertDialog`, `Dialog`, `SegmentedControl`, `TabList`, `Switch`, `Badge`, `Banner`, `EmptyState`, `useToast`).
