---
name: universal-responsive-ui
description: >-
  Estándar maestro de diseño responsive universal y ergonomía multi-dispositivo
  para Gran Catador / Distribuidora Bodegón del Catador. Rige la adaptabilidad
  perfecta en móviles compactos (320px-375px), smartphones modernos (390px-430px),
  tablets (768px-1024px), laptops (1280px-1440px), monitores de escritorio (1920px)
  y pantallas ultrawide.
---

# Universal Responsive UI & Multi-Device Experience

Guía normativa obligatoria para garantizar que todas las vistas, componentes, formularios, grillas comerciales y modales de **Gran Catador / Distribuidora Bodegón del Catador** funcionen a la perfección y ofrezcan una estética de primer nivel en cualquier pantalla y dispositivo del mundo.

---

## 1. Escala de Breakpoints Oficiales

Todo diseño debe construirse pensando en **Mobile-First** con adaptación progresiva fluida utilizando los breakpoints oficiales de TailwindCSS:

| Breakpoint | Rango de Resolución | Dispositivos Representativos | Patrón de Diseño Principal |
| :--- | :--- | :--- | :--- |
| **`xs` (Base)** | `< 640px` (320px – 480px) | iPhone SE, iPhone 13/14/15, Galaxy S/A | 1–2 columnas, drawers de ancho completo (`w-full`), tipografía compacta, bottom actions accesibles con pulgar. |
| **`sm`** | `640px – 767px` | Móviles en horizontal, phablets | 2–3 columnas, espaciados medianos, filtros condensados. |
| **`md`** | `768px – 1023px` | iPad / Tablets en vertical | 3–4 columnas, cabeceras híbridas, barras laterales colapsables, menús tipo overlay. |
| **`lg`** | `1024px – 1279px` | iPad Pro en horizontal, Laptops compactas | 4–5 columnas, drawers laterales fijados (`max-w-md`), navegación superior desplegable completa. |
| **`xl`** | `1280px – 1535px` | Laptops estándar y pantallas de escritorio | 5–6 columnas, Bento Grid completo de 5 columnas, doble barra de navegación. |
| **`2xl`** | `>= 1536px` | Monitores grandes, TVs y Ultrawide | Contención obligatoria con `container mx-auto max-w-7xl` para evitar estiramientos antiestéticos de tarjetas. |

---

## 2. Regla Cero: Cero Desbordamiento Horizontal y Pistas de Scroll Clarísimas

El desbordamiento horizontal accidental es considerado un fallo crítico de calidad:
1. **Contenedor Raíz:** Prohibido que cualquier elemento fuerce un ancho mayor al viewport (`max-w-full`, `overflow-x-clip` o `overflow-x-hidden` en estructuras base).
2. **Tratamiento de Texto Largo y Alineación de Filas:** Todo título de producto debe contar con `line-clamp-2` y una **altura fija reservada (`h-[40px] sm:h-[44px]`)** para que los selectores `Unidad / Caja` y botones `+ Agregar` queden 100% alineados horizontalmente entre tarjetas de la misma fila.
3. **Barras de Filtros y Pestañas Deslizables:** Cuando una tira de departamentos o subcategorías tenga scroll horizontal, es **obligatorio** añadir flechas de desplazamiento (`ChevronLeft` / `ChevronRight`) y/o un degradado lateral (`bg-gradient-to-l`) para que el usuario nunca vea textos cortados sin saber que puede deslizar.
4. **Fórmulas Flex:** Todo hijo directo dentro de un contenedor flex que contenga texto debe incluir `min-w-0` para permitir que el truncamiento funcione correctamente.

---

## 3. Ergonomía Táctil y Zona del Pulgar (Thumb-Zone Optimization)

En dispositivos móviles (>70% del tráfico retail en Venezuela), la interacción es 100% táctil y a menudo con una sola mano:
1. **Áreas Táctiles Mínimas (Touch Targets):**
   - Todo botón, enlace, selector o casilla de verificación debe tener un área táctil mínima de **44 × 44 px** (recomendado **48 × 48 px** según estándares WCAG AAA).
   - En botones compactos (ej. selectores de cantidad `+` / `-`), complementar con `p-2` o `min-h-[40px] min-w-[40px] flex items-center justify-center`.
2. **Separación entre Elementos:**
   - Separación mínima de 8px (`gap-2`) entre elementos interactivos para evitar toques accidentales.
3. **Soporte de Safe Areas (iOS Notch & Dynamic Island):**
   - Elementos fijos en la parte inferior (ej. barra de checkout, bottom bar) deben incluir relleno seguro: `pb-[calc(env(safe-area-inset-bottom)+0.75rem)]`.
4. **Prevención de Zoom Forzado en iOS:**
   - Todo campo `<input>` y `<select>` debe tener un tamaño de fuente base no inferior a `16px` (`text-base md:text-xs` o `text-base md:text-sm`) para evitar que Safari en iPhone haga zoom involuntario al enfocar el campo.

---

## 4. Jerarquía Tipográfica, Contraste (Mínimo 13–14px) y Bimonetarismo Responsivo

La visualización de precios duales (**Dólares $ USD** y **Bolívares Bs. BCV**) y los textos de interfaz deben ser legibles en cualquier pantalla:
1. **Tamaño Mínimo de Lectura (13px–14px):**
   - Textos de navegación, barra superior (dirección y tasa BCV), descripciones de categorías, enlaces de footer y filtros deben usar como mínimo **`13px–14px` (`text-[13px] sm:text-sm`)** con alto contraste (`text-slate-700` sobre fondo claro, `text-slate-200`/`text-white` sobre fondo oscuro).
2. **Fichas de Producto en Móvil y Escritorio:**
   - Contenedor de imagen unificado en fondo blanco puro (`bg-white`), `object-contain` y padding amplio (`p-4`).
   - USD: `text-base sm:text-lg font-black text-slate-900 tabular-nums` (o rojo si es oferta).
   - Bs. BCV: `text-xs sm:text-[13px] font-bold text-slate-600 block leading-tight tabular-nums`.
   - Botón explícito **`+ Agregar`** en naranja (`#E07A1F`) o contador de cantidad (`- 1 +`).
3. **Encabezados Principales:**
   - Escala fluida: `text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight`.
   - Subtítulos: `text-[13px] sm:text-base text-slate-600`.

---

## 5. Componentes Clave: Adaptabilidad Específica

### A. Cabecera (Header de 3 Niveles)
- **Móvil (`< 768px`):**
  - Barra superior simplificada: Muestra la tasa BCV oficial en formato píldora táctil y la ciudad.
  - Barra principal: Logo proporcional (`h-9 w-36`), buscador amplio accesible y accesos directos táctiles (Cuenta y Carrito con badge flotante).
  - La navegación de categorías de departamentos se despliega mediante Drawer o selector deslizable.
- **Escritorio (`>= 768px`):**
  - Barra superior completa con teléfonos, horarios y tasa interactiva.
  - Buscador central extendido (`max-w-2xl`).
  - Barra azul rey `#00227B` fija con botón desplegable de departamentos y accesos rápidos.

### B. Carrito Deslizable (`CartDrawer`) & Modales
- **Móvil (`< 640px`):** Ocupa el **100% del ancho de la pantalla** (`w-full`), permitiendo visualizar claramente cada producto, cantidades y el desglose de pago sin apretujarse.
- **Escritorio (`>= 640px`):** Se limita a un panel lateral de `max-w-md` con efecto backdrop desenfocado (`backdrop-blur-sm`).

### C. Bento Grid Asimétrico & Secciones de Oferta
- **Móvil (`< 768px`):** Transforma la grilla en 2 columnas simétricas fluidas (`grid-cols-2 gap-3`). El producto estrella se adapta con su imagen en proporción cuadrada (`aspect-square`) y badges legibles.
- **Escritorio (`>= 1024px`):** Grilla completa de 5 columnas con producto estrella central ocupando doble fila (`col-span-1 row-span-2`).

### D. Formularios de Checkout y Pasarelas de Pago
- El selector de métodos (Pago Móvil, Zelle, Efectivo) se distribuye en `grid-cols-1 sm:grid-cols-3 gap-2.5`.
- Los datos bancarios (Banco, Teléfono, Cédula) se dividen en tarjetas con botón de copiar rápido táctil con feedback visual inmediato.

---

## 6. Checklist Obligatorio de Verificación Responsiva

Antes de dar por completado cualquier desarrollo de UI o ajuste en vistas:
- [ ] **Móvil Compacto (360px – 390px):** ¿Se lee todo sin desborde horizontal? ¿Los precios bimonetarios caben sin superponerse?
- [ ] **Móvil Moderno (393px – 430px):** ¿Las tarjetas de producto llenan armónicamente el ancho?
- [ ] **Tablet Vertical (768px):** ¿Las grillas pasan limpiamente a 3 o 4 columnas?
- [ ] **Escritorio Estándar (1280px – 1440px):** ¿El header de 3 niveles y el Bento Grid se despliegan en su formato premium?
- [ ] **Ultrawide (> 1536px):** ¿El contenedor principal respeta el límite de contención sin estirar las tarjetas a extremos absurdos?
- [ ] **Botones Táctiles:** ¿Tienen al menos 44px de altura o área táctil cómoda?
- [ ] **Safe Area:** ¿Los elementos inferiores tienen espacio suficiente para no chocar con la barra de navegación de Android o el Home Indicator de iOS?
