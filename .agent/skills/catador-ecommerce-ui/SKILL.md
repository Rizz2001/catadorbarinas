---
name: catador-ecommerce-ui
description: >-
  Sistema de diseño UI/UX de alta densidad, identidad de marca y reglas de negocio bimonetarias
  para Gran Catador / Distribuidora Bodegón del Catador. Utilizar en el desarrollo de vistas,
  componentes, banners, tarjetas de producto y carritos.
---

# Gran Catador / Distribuidora Bodegón del Catador - UI/UX & Sistema de Diseño

Manual maestro de diseño visual y experiencia de usuario e-commerce para **Gran Catador / Distribuidora Bodegón del Catador**.

---

## 1. Estética e Identidad Visual (Retail High-Density)
- **Estilo:** Mobile-First, retail/supermercado y bodegón premium de alta densidad visual (inspirado en el layout de referencia Digitaz), con navegación veloz, contrastes nítidos y carga instantánea.
- **Paleta de Colores Oficial (extraída directamente del logo de Bodegón del Catador):**
  - **`catador-blue` (Primary):** `#00227B` (Azul Rey profundo para la barra de navegación de departamentos, bordes de secciones destacadas, botones de compra principales y cabeceras).
  - **`catador-blue-light` (Hover/Gradient):** `#0A38A8` (Azul vibrante para estados activos/hover y degradados radiales de los banners principales).
  - **`catador-amber` (Accent/Barril):** `#E07A1F` con hover `#C85A08` (Naranja/Ámbar madera extraído del barril de roble del logo; usado para contadores regresivos de ofertas, badges de stock, estrellas de valoración y CTAs secundarios).
  - **`discount-red` (Alerta/Oferta):** `#EF4444` (Rojo vibrante para etiquetas de porcentaje de descuento como `-20%`, `-35%`).
  - **`bg-surface`:** `#F8FAFC` (`slate-50`) para el fondo general del sitio, proporcionando máximo contraste contra las tarjetas de producto en blanco puro (`#FFFFFF`) con bordes sutiles `border-slate-200`.

---

## 2. Regla Inquebrantable Bimonetaria (USD + VES BCV)
El e-commerce opera bajo la realidad comercial de Venezuela:
1. **Prohibido terminantemente mostrar precios en una sola moneda.**
2. **Jerarquía Visual en Fichas de Producto y Carrito:**
   - **Precio en Dólares ($ USD):** Valor principal en negrita prominente (`text-base` o `text-lg` en `font-bold`). Color rojo `#EF4444` si tiene descuento, o `#0F172A` si es precio regular.
   - **Precio en Bolívares (Bs. / VES):** Justo debajo en tipografía compacta (`text-xs font-semibold text-slate-600`), calculado en tiempo real con la tasa oficial del BCV.
3. **Formateo Estricto de Números:**
   - **USD:** Formato con punto decimal y coma para miles (ej. `$12.50`, `$1,250.00`).
   - **Bolívares:** Formato venezolano con coma decimal y punto para miles (ej. `Bs. 545,25`, `Bs. 54.521,75`).
4. **Helper Centralizado:** Todo componente debe utilizar `formatPrices(priceUsd, bcvRate)` o `formatDiscountedPrices(...)` de `src/lib/currency.ts`.

---

## 3. Anatomía Visual de la Página de Inicio (Layout Digitaz)
1. **Header de 3 Niveles:**
   - *Top Bar:* Enlaces rápidos, soporte y Badge interactivo con la **Tasa BCV Oficial del día**.
   - *Main Header:* Logotipo a la izquierda, buscador central amplio redondeado (`rounded-full`) con selector de categorías/departamentos integrado, iconos de usuario, lista de deseos y disparador del Carrito (`CartTrigger`) con badge numérico y monto total en USD.
   - *Bottom Nav (Azul Rey `#00227B`):* Botón "Comprar por Departamento" con menú desplegable, enlaces directos a categorías y botón con animación *"🔥 Ofertas del Día"*.
2. **Hero Section & Accesos Rápidos:**
   - Banner principal con degradado Azul Catador (`#00227B` a `#0A38A8`), copys de impacto, precio destacado en ámbar y CTA blanco.
   - Fila horizontal de iconos circulares para categorías rápidas (Licores, Víveres, Charcutería, Carnicería, Snacks, Refrescos).
   - Grid de 3 banners promocionales secundarios.
3. **Sección "Ofertas Destacadas del Día" (Today's Featured Deals):**
   - Marco contenedor con borde grueso azul (`border-2 border-[#00227B] rounded-2xl bg-white p-4 shadow-sm`).
   - Título destacado a la izquierda y **Contador Regresivo (Countdown Timer)** con cajitas ámbar `#E07A1F` para Horas, Minutos y Segundos a la derecha.
4. **Sección "Tendencias de la Semana" (Bento Grid Asimétrico de 5 Columnas):**
   - Pestañas de filtro tipo píldora (*Más Vendidos*, *Ofertas*, *Novedades*).
   - Grilla de 5 columnas en escritorio: 2 columnas laterales de productos apilados, y **columna central gigante (`row-span-2 col-span-1`)** destacando el producto estrella de la semana con imagen en gran formato.

---

## 4. Carrito Deslizable (`CartDrawer`) & Checkout
- Drawer lateral deslizable con persistencia en `localStorage`.
- Visualización dual constante en Subtotal, Descuentos, Envío y Total en ambas monedas.
- Botón de confirmación con generación de mensaje estructurado para WhatsApp oficial de Gran Catador Barinas.
