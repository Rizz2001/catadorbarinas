---
name: catador-ecommerce-ui
description: >-
  Sistema de diseño UI/UX de alta densidad, dirección de arte Taste Skill (Anti-Slop), identidad
  de marca y reglas de negocio bimonetarias para Gran Catador / Distribuidora Bodegón del Catador.
  Utilizar en el desarrollo de vistas, componentes, banners, tarjetas de producto y carritos.
---

# Gran Catador / Distribuidora Bodegón del Catador - UI/UX & Taste Skill System

Manual maestro de diseño visual, dirección de arte **Taste Skill (`design-taste-frontend`)** y experiencia de usuario e-commerce para **Gran Catador / Distribuidora Bodegón del Catador**.

---

## 1. Dirección de Arte & Reglas "Anti-Slop" (`design-taste-frontend`)
1. **Paleta Disciplinada (Un Fondo, Una Tinta, Dos Acentos de Marca):**
   - **`bg-surface` (Fondo):** `#F8FAFC` (`slate-50`) para el lienzo general y `#FFFFFF` para tarjetas de producto y contenedores.
   - **`ink` (Tinta Principal):** `#0F172A` (`slate-900`) para títulos y datos clave; `#475569` (`slate-600`) para textos de soporte.
   - **`catador-blue` (Primary):** `#00227B` y `#0A38A8` (Azul Rey oficial de Gran Catador).
   - **`catador-amber` (Accent/Barril):** `#E07A1F` y `#C85A08` (Ámbar roble oficial).
   - **`discount-red` (Oferta):** `#EF4444` exclusivamente para descuentos reales.
   - **Prohibido el "Confeti de Colores IA":** No usar cajas de iconos con colores aleatorios (morado, rosado, cian, verde neón) que rompan la sobriedad del bodegón.
2. **Cero Ornamentos Artificiales (House Rules Adaptadas):**
   - **Sin "Blobs" de Luz Difuminados:** Prohibido colocar círculos difuminados (`blur-3xl`) decorativos en fondos.
   - **Los Datos y la Tipografía Mandan (KPIs are Type, not Tiles):** Evitar repetir el cliché de un icono encerrado en un cuadrito de color junto a cada título de sección. Usar jerarquía tipográfica firme (`tracking-[-0.025em]`), líneas arquitectónicas limpias y cifras reales.
   - **Superficies en Reposo Planas y Nítidas:** Las tarjetas en reposo se separan por un paso de tono (`#F8FAFC` vs `#FFFFFF`) y un borde nítido de `1px` (`border-slate-200`), reservando la elevación para estados `hover` o modales flotantes.
   - **Precisión Numérica Tabular (`tabular-nums`):** Todo precio (`$ USD` y `Bs. BCV`), contador de tiempo, stock o código de orden debe renderizarse con `tabular-nums` para alineación vertical perfecta.

---

## 2. Regla Inquebrantable Bimonetaria (USD + VES BCV)
El e-commerce opera bajo la realidad comercial de Venezuela:
1. **Prohibido terminantemente mostrar precios en una sola moneda.**
2. **Jerarquía Visual en Fichas de Producto y Carrito:**
   - **Precio en Dólares ($ USD):** Valor principal en negrita prominente (`font-black tabular-nums tracking-tight`). Color rojo `#EF4444` si tiene descuento, o `#0F172A` si es precio regular.
   - **Precio en Bolívares (Bs. / VES):** Justo debajo en tipografía compacta (`text-xs font-bold tabular-nums text-slate-600`), calculado en tiempo real con la tasa oficial del BCV.
3. **Formateo Estricto de Números:**
   - **USD:** Formato con punto decimal y coma para miles (ej. `$12.50`, `$1,250.00`).
   - **Bolívares:** Formato venezolano con coma decimal y punto para miles (ej. `Bs. 545,25`, `Bs. 54.521,75`).
4. **Helper Centralizado:** Todo componente debe utilizar `formatPrices(priceUsd, bcvRate)` de `src/lib/currency.ts`.

---

## 3. Anatomía Visual de la Página de Inicio
1. **Header de 3 Niveles:**
   - *Top Bar:* Enlaces rápidos, ubicación Barinas y Badge interactivo con la **Tasa BCV Oficial del día** (`tabular-nums`).
   - *Main Header:* Logotipo oficial, buscador central amplio con autocompletado en vivo, accesos a Favoritos, Mi Cuenta y disparador del Carrito (`CartTrigger`).
   - *Bottom Nav (`#00227B`):* Navegación directa por departamentos de SmartVentas y acceso a Ofertas del Día.
2. **Hero Section & Departamentos Rápidos:**
   - Banner principal en Azul Rey `#00227B` limpio (sin blobs difuminados), titular de máximo 2-3 líneas con tracking editorial (`tracking-[-0.03em]`), y ficha real del **Producto Destacado en Inventario** con precios bimonetarios tabulares.
   - Tira arquitectónica de departamentos rápidos con estética monocromática de marca (`#00227B` / `#E07A1F`).
3. **Barra de Garantías Comerciales (`TrustValueBar`):**
   - Banda arquitectónica unificada con divisores limpios donde la cifra clave (`< 45 min`, `BCV Oficial`, `Depósito 01`, `Bs. / $ USD`) protagoniza el bloque sin depender de tarjetas con iconos de colores.
4. **Sección "Ofertas Destacadas del Día" & "Tendencias de la Semana":**
   - Cabeceras editoriales limpias con temporizador regresivo tabular (`tabular-nums`) y grillas de alta densidad donde la fotografía de la botella/artículo y su selector `Unidad | Caja x12` son los protagonistas.
5. **Footer de Cierre Arquitectónico:**
   - Cierre sobrio en tono oscuro (`#0B1120`) con datos fiscales reales (`RIF`, dirección en Av. 23 de Enero Barinas), enlaces directos y firma de marca a ancho completo.
