---
name: universal-responsive-ui
description: >-
  Estándar maestro de diseño responsive universal y ergonomía multi-dispositivo
  para EL CATADOR. (Gran Catador / Distribuidora Bodegón del Catador). Rige la
  adaptabilidad perfecta bajo la Opción C (Bodegón Moderno Navy & Oro) en móviles
  compactos (320px-375px), smartphones modernos (390px-430px), tablets (768px-1024px),
  laptops (1280px-1440px), monitores de escritorio (1920px) y pantallas ultrawide.
---

# Universal Responsive UI & Multi-Device Experience (EL CATADOR. — Opción C)

Guía normativa obligatoria para garantizar que todas las vistas, componentes, formularios, grillas comerciales y modales de **EL CATADOR.** funcionen a la perfección en cualquier pantalla y dispositivo del mundo bajo el sistema **Navy & Oro**.

---

## 1. Escala de Breakpoints Oficiales

Todo diseño debe construirse pensando en **Mobile-First** con adaptación progresiva fluida utilizando los breakpoints oficiales de TailwindCSS:

| Breakpoint | Rango de Resolución | Dispositivos Representativos | Patrón de Diseño Principal |
| :--- | :--- | :--- | :--- |
| **`xs` (Base)** | `< 640px` (320px – 480px) | iPhone SE, iPhone 13/14/15, Galaxy S/A | 2 columnas en tarjetas y categorías (`grid-cols-2`), drawers/bottom sheets de ancho completo (`w-full`), `BottomNav` con indicador en gota. |
| **`sm`** | `640px – 767px` | Móviles en horizontal, phablets | 2–3 columnas, espaciados medianos, filtros condensados en píldoras. |
| **`md`** | `768px – 1023px` | iPad / Tablets en vertical | 3–4 columnas, cabeceras híbridas, barras laterales colapsables, checkout en 2 columnas. |
| **`lg`** | `1024px – 1279px` | iPad Pro en horizontal, Laptops compactas | 4 columnas en catálogo, drawers laterales (`max-w-md`), barra de navegación Navy completa y PDP en 3 columnas. |
| **`xl`** | `1280px – 1535px` | Laptops estándar y pantallas de escritorio | Hero Navy con 4 tarjetas Bento superpuestas, tira horizontal de categorías y grillas amplias. |
| **`2xl`** | `>= 1536px` | Monitores grandes, TVs y Ultrawide | Contención obligatoria con `container mx-auto max-w-7xl` para evitar estiramientos antiestéticos de tarjetas. |

---

## 2. Regla Cero: Cero Desbordamiento Horizontal y Pistas de Scroll Clarísimas

El desbordamiento horizontal accidental es considerado un fallo crítico de calidad:
1. **Contenedor Raíz:** Prohibido que cualquier elemento fuerce un ancho mayor al viewport (`max-w-full`, `overflow-x-clip` en estructuras base).
2. **Tratamiento de Texto Largo y Alineación de Filas:** Todo título de producto debe contar con `line-clamp-2` y una **altura fija reservada (`h-[40px] sm:h-[44px]`)** para que el selector `Unidad | Caja`, precios duales y cápsula `- 1 +` queden 100% alineados horizontalmente entre tarjetas de la misma fila.
3. **Barras de Filtros y Pestañas Deslizables:** Cuando una tira de departamentos o subcategorías tenga scroll horizontal, es **obligatorio** añadir flechas de desplazamiento (`ChevronLeft` / `ChevronRight`) y/o un degradado lateral (`bg-gradient-to-l`) para que el usuario nunca vea textos cortados sin saber que puede deslizar.
4. **Fórmulas Flex:** Todo hijo directo dentro de un contenedor flex que contenga texto debe incluir `min-w-0` para permitir que el truncamiento funcione correctamente.

---

## 3. Ergonomía Táctil y Zona del Pulgar (Thumb-Zone Optimization)

En dispositivos móviles (>70% del tráfico retail en Venezuela), la interacción es 100% táctil y a menudo con una sola mano:
1. **Áreas Táctiles Mínimas (Touch Targets):**
   - Todo botón, enlace, selector o casilla de verificación debe tener un área táctil mínima de **44 × 44 px**.
   - Para el **botón circular flotante `+` o `>`** (`32px–36px` visual), envolver o expandir el área interactiva (`min-h-[44px] min-w-[44px]` o padding invisible táctil) sin romper la proporción compacta de la tarjeta.
   - En la **cápsula stepper `- 1 +`**, asegurar `min-h-[38px]`–`44px` en móvil y `gap-2` mínimo entre controles vecinos.
2. **Soporte de Safe Areas (iOS Notch & Dynamic Island):**
   - Elementos fijos en la parte inferior (`BottomNav`, barra flotante del carrito y Auth Bottom Sheet) deben incluir relleno seguro: `pb-[calc(env(safe-area-inset-bottom)+0.75rem)]`.
3. **Prevención de Zoom Forzado en iOS:**
   - Todo campo `<input>` y `<select>` (incluyendo el buscador en píldora y los formularios de Auth/Checkout) debe tener un tamaño de fuente base no inferior a `16px` (`text-base md:text-sm`) para evitar que Safari en iPhone haga zoom involuntario al enfocar el campo.

---

## 4. Jerarquía Tipográfica, Contraste (Mínimo 13–14px) y Bimonetarismo Responsivo

1. **Tamaño Mínimo de Lectura (13px–14px):**
   - Textos de navegación, barra superior (dirección y tasa BCV), descripciones de categorías, enlaces de footer y filtros deben usar como mínimo **`13px–14px` (`text-[13px] sm:text-sm`)** con alto contraste (`#0F172A` / `text-slate-700` sobre `#FFFFFF` o `#F7F8FA`; `text-white` / `text-slate-200` sobre `#0F172A` / `#001754`).
2. **Fichas de Producto en Móvil y Escritorio (`ProductCard`):**
   - Escenario fotográfico uniforme en blanco puro (`bg-white`), `object-contain` y padding amplio (`p-3 sm:p-4`).
   - Botón circular **`+`** `#0F172A` arriba a la derecha; badge dorado `-15%` / `Caja xN` abajo a la izquierda de la imagen.
   - Selector píldora **`Unidad | Caja`** legible y constante (`min-h-[36px]`).
   - USD: `text-base sm:text-lg font-black text-[#0F172A] tabular-nums`.
   - Bs. BCV: `text-xs sm:text-[13px] font-bold text-slate-600 block leading-tight tabular-nums`.
   - Cuando está en el carrito: cápsula sólida Navy **`- 1 +`** (`rounded-full bg-[#0F172A] text-white tabular-nums`).
3. **Encabezados Principales:**
   - Escala fluida: `text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight`.

---

## 5. Componentes Clave: Adaptabilidad Específica

### A. Cabecera y Navegación (`Header` + `BottomNav`)
- **Móvil (`< 768px`):**
  - Top bar compacta con dirección (`Alto Barinas / Barinas`), perfil/notificaciones y **píldora dorada `Tasa BCV`**.
  - Buscador en píldora (`rounded-full`) de ancho completo + **tira horizontal deslizable de chips con icono circular** (`BCV`, `Delivery GPS`, `Por Caja`, `Ofertas`).
  - `BottomNav` fijo con 5 tabs (`Inicio`, `Catálogo`, `Ofertas`, `Carrito`, `Mi Cuenta`) y el tab activo resaltado en **gota Navy (`#0F172A`)**.
- **Escritorio (`>= 768px`):**
  - Top utility bar con sede y tasa BCV, cabecera blanca con logo `EL CATADOR.`, píldora buscador central (`max-w-2xl`), favoritos, cuenta y carrito; barra de navegación Navy (`#0F172A` / `#001754`) debajo.

### B. Hero Editorial + 4 Tarjetas Bento (`HeroBanner`)
- **Móvil (`< 768px`):** Banner vertical/compacto con historia/promos en carrusel deslizable y acceso rápido a las 4 tarjetas destacadas (`grid-cols-2` o scroll horizontal suave).
- **Escritorio (`>= 1024px`):** Banner Navy ancho completo con **4 tarjetas Bento blancas superpuestas** en el borde inferior (`grid-cols-4 gap-3.5`).

### C. Tarjetas de Categorías (`QuickCategoriesStrip` & `/catalogo`)
- **Móvil:** Grilla `grid-cols-2 gap-3` con tarjetas blancas redondeadas, foto centrada grande y **cintillo inferior de color por departamento con pestaña diagonal `+`** (en portada puede mostrarse como tira circular deslizable de acceso rápido).
- **Escritorio:** Tira horizontal de iconos circulares limpios en portada y barra lateral/pills horizontales con flechas `< >` en `/catalogo`.

### D. Ficha de Producto (`/producto/[id]`), Carrito (`CartDrawer`) y Auth Bottom Sheet
- **PDP Móvil (`< 1024px`):** 1 columna apilada con galería, selector píldora `Unidad | Caja`, precio dual, stepper `- 1 +`, mapa GPS Barinas y barra/botón fijo de compra.
- **PDP Escritorio (`>= 1024px`):** Layout **3 columnas** (Galería izquierda | Ficha técnica y selector centro | *Sticky Buy Box* derecha) + fila inferior combinada de **Mapa GPS Barinas** y carrusel **`Completa tu combo`** con `+` circulares.
- **Carrito & Auth Bottom Sheet:** En móvil, `CartDrawer` ocupa `w-full` y el acceso requerido antes del checkout se muestra como **Bottom Sheet (`rounded-t-3xl`)** con botón full-width `#0F172A` `Iniciar sesión` y enlace `Cancelar`. En escritorio, drawer lateral `max-w-md` con fondo difuminado.

### E. Checkout, Perfil (`/cuenta`) y Panel Administrativo CMS (`/admin/*`)
- **Checkout 4 Pasos:** Stepper `grid-cols-4` compacto en móvil y completo en escritorio; métodos de pago (`Pago Móvil`, `Transferencia`, `Zelle`, `Efectivo USD`) en `grid-cols-2 sm:grid-cols-4` con copiado en 1 clic.
- **Perfil (`/cuenta`):** `AccountHero` adaptable (stacked en móvil, horizontal con stats en escritorio), tabs deslizables en píldora (`Mis Pedidos`, `Mi Perfil y GPS`, `Seguridad`).
- **CMS (`/admin/*`):** Sidebar Navy `#0F172A` fijo en escritorio (`>= 768px`) y drawer deslizable en móvil (`< 768px`), manteniendo `Dialog`/`AlertDialog`/`SegmentedControl` de Meta Astryx adaptados al `viewport`.

---

## 6. Checklist Obligatorio de Verificación Responsiva

Antes de dar por completado cualquier desarrollo de UI o ajuste en vistas:
- [ ] **Móvil Compacto (360px – 390px):** ¿Cero overflow horizontal? ¿Los precios duales USD/Bs, la cápsula `- 1 +` y el cintillo diagonal `+` caben sin superponerse?
- [ ] **Móvil Moderno (393px – 430px):** ¿Las tarjetas 2×2 llenan armónicamente el ancho y la gota activa de `BottomNav` respeta el `safe-area-inset-bottom`?
- [ ] **Tablet Vertical (768px):** ¿Las grillas pasan limpiamente a 3 o 4 columnas y las pestañas de filtro muestran flechas de scroll?
- [ ] **Escritorio Estándar (1280px – 1440px):** ¿El Hero Navy con 4 tarjetas Bento superpuestas y la PDP de 3 columnas se despliegan sin cortes?
- [ ] **Ultrawide (> 1536px):** ¿El contenedor principal respeta `max-w-7xl` sin estirar tarjetas ni dejar huecos?
- [ ] **Touch Targets:** ¿Todos los controles circulares `+`/`>`, steppers y chips cumplen con área táctil `>= 44px`?
