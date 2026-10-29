---
name: agent-browser
description: >-
  Automatización, inspección y testing E2E en navegador web headless o interactivo mediante agent-browser (Vercel Labs).
  Permite a agentes de IA interactuar con páginas, rellenar formularios, verificar accesibilidad, extraer snapshots
  semánticos con referencias deterministas (@e1, @e2), capturar pantallas y validar flujos comerciales en vivo.
---

# Agent Browser (Vercel Labs) - E2E Testing & Browser Automation

Guía operativa y estándar de automatización para pruebas en navegador web de **Gran Catador / Distribuidora Bodegón del Catador** utilizando [`agent-browser`](https://github.com/vercel-labs/agent-browser) de Vercel Labs.

---

## 1. ¿Qué es `agent-browser`?

`agent-browser` es un CLI de automatización de navegador de alto rendimiento desarrollado por Vercel Labs, diseñado específicamente para agentes de Inteligencia Artificial:

- **Árbol Semántico Compacto (Accessibility Tree):** En lugar de volcar todo el DOM HTML (lo que satura el contexto y gasta miles de tokens), genera un snapshot accesible ultra-compacto donde cada elemento interactivo recibe una etiqueta de referencia única determinista (ej. `@e1`, `@e2`, `@e3`).
- **Control Determinista por Referencias:** Los agentes interactúan directamente con `@e1` sin necesidad de adivinar selectores CSS complejos ni XPath frágiles.
- **Arquitectura Cliente-Daemon CDP:** Utiliza Chrome DevTools Protocol (CDP) directo a través de un daemon persistente en segundo plano, permitiendo encadenar comandos sucesivos manteniendo el estado del navegador.
- **Motor Axe-Core Integrado:** Incluye auditorías de accesibilidad WCAG listas para usar.

---

## 2. Comandos Principales & Sintaxis en Windows (PowerShell)

> [!IMPORTANT]
> En entornos Windows PowerShell, utiliza punto y coma (`;`) para encadenar comandos en lugar de `&&`.
> Ejecuta siempre con `npx.cmd agent-browser` o `agent-browser`.

### Ciclo Básico de Navegación e Inspección

```powershell
# 1. Abrir una URL con una sesión nombrada
npx.cmd agent-browser --session catador open http://localhost:3000

# 2. Obtener el snapshot de elementos interactivos (botones, enlaces, inputs)
npx.cmd agent-browser --session catador snapshot -i

# 3. Hacer clic en una referencia de elemento
npx.cmd agent-browser --session catador click @e2

# 4. Rellenar campos de formulario
npx.cmd agent-browser --session catador fill @e3 "04141234567"

# 5. Extraer texto o valores
npx.cmd agent-browser --session catador get text @e1

# 6. Inspeccionar consola y errores de JavaScript
npx.cmd agent-browser --session catador console
npx.cmd agent-browser --session catador errors

# 7. Capturar pantalla (con anotaciones o limpia)
npx.cmd agent-browser --session catador screenshot --annotate ./test-results/inicio.png

# 8. Cerrar la sesión del navegador
npx.cmd agent-browser --session catador close
```

---

## 3. Playbooks de Pruebas para Gran Catador

### Playbook A: Verificación de Inicio y Bimonetarismo
Valida que la cabecera de 3 niveles cargue la tasa BCV oficial y que las tarjetas muestren precios duales en USD y Bs.

```powershell
npx.cmd agent-browser --session test-home open http://localhost:3000; npx.cmd agent-browser --session test-home snapshot -i
```
- **Puntos de Control:**
  1. Verificar presencia del badge *"Tasa Oficial BCV: Bs. ..."*.
  2. Confirmar que el contador de ofertas del día (`FeaturedDealsBox`) esté activo.
  3. Revisar que las tarjetas de producto tengan precio en USD y Bs.

### Playbook B: Flujo del Carrito y Drawer Deslizable
Prueba la interactividad de agregar productos, modificar cantidades y verificar cálculos.

```powershell
# Abrir y localizar el primer botón de agregar al carrito
npx.cmd agent-browser --session test-cart open http://localhost:3000; npx.cmd agent-browser --session test-cart snapshot -i
# Hacer clic en agregar (@eX) y abrir el carrito
npx.cmd agent-browser --session test-cart click @eX; npx.cmd agent-browser --session test-cart snapshot -i
# Cerrar sesión
npx.cmd agent-browser --session test-cart close
```

### Playbook C: Formulario de Checkout y Validación
Comprueba que el checkout bloquee compras sin datos requeridos y presente los métodos bancarios venezolanos.

```powershell
npx.cmd agent-browser --session test-checkout open http://localhost:3000/checkout; npx.cmd agent-browser --session test-checkout snapshot -i
npx.cmd agent-browser --session test-checkout close
```

### Playbook D: Auditoría de Accesibilidad (WCAG)
Ejecuta la auditoría automática con el motor de axe-core integrado:

```powershell
npx.cmd agent-browser a11y http://localhost:3000 --tags wcag2a,wcag2aa --json
```

### Playbook E: Métricas Core Web Vitals
Mide LCP, FCP, CLS e hidratación de React 19:

```powershell
npx.cmd agent-browser vitals http://localhost:3000
```

---

## 4. Sub-Skills Dinámicas de `agent-browser`

Cuando requieras flujos avanzados, consulta la documentación en vivo del CLI:

- **Manual Completo y Referencia de Comandos:**
  ```powershell
  npx.cmd agent-browser skills get core --full
  ```
- **QA Exploratorio y Detección Sistemática de Errores (Dogfooding):**
  ```powershell
  npx.cmd agent-browser skills get dogfood
  ```

---

## 5. Reglas de Higiene para el Agente

1. **Gestión de Sesión:** Siempre asigna un identificador a la sesión con `--session <nombre>` para aislar contextos de prueba.
2. **Cierre Obligatorio:** Siempre finaliza cada rutina de pruebas con `agent-browser --session <nombre> close` para liberar el puerto CDP y no dejar instancias zombis de Chrome en memoria.
3. **Pausas para Renderizado:** En páginas con carga asíncrona (como catálogo FoxData), utiliza `agent-browser --session <nombre> wait 2000` antes de tomar el snapshot.
