# App Router Route Map (`src/app/`)

## Public Storefront Routes
- `/` — `src/app/page.tsx` (`RootLayout`): Main Bodegón storefront with `HeroBanner` + 4 Bento Cards, `QuickCategoriesStrip`, `WeeklyTrendsBento`, `FeaturedDealsBox`, `PromoBannersGrid`, `TrustValueBar`, and `LiveCatalogSection`.
- `/catalogo/[[...slug]]` — `src/app/catalogo/[[...slug]]/page.tsx` (`RootLayout`): Full department & subgroup catalog browser with filter pills (`Solo Ofertas`, `Disponible por Caja`, `En Stock`) and price sorting.
- `/producto/[id]` — `src/app/producto/[id]/page.tsx` (`RootLayout`): 3-column Product Detail Page (PDP) with gallery, `Unidad | Caja` selector, dual USD/VES pricing, and Barinas GPS delivery calculator.
- `/buscar` — `src/app/buscar/page.tsx` (`RootLayout`): Live search results with recent and popular queries.
- `/favoritos` — `src/app/favoritos/page.tsx` (`RootLayout`): Saved favorite products grid.
- `/carrito` — `src/app/carrito/page.tsx` (`RootLayout`): Full shopping cart view alongside `CartDrawer` and `AuthBottomSheet`.
- `/checkout` — `src/app/checkout/page.tsx` (`RootLayout`): Multi-step checkout with interactive GPS map in Barinas (`Pago Móvil`, `Transferencia`, `Zelle`, `Efectivo USD`).
- `/pedidos/[id]` — `src/app/pedidos/[id]/page.tsx` (`RootLayout`): Real-time order status & invoice summary.

## Customer Authentication & Account Routes
- `/login` — `src/app/login/page.tsx` (`RootLayout`): Customer sign-in view.
- `/registro` — `src/app/registro/page.tsx` (`RootLayout`): Customer registration view with Venezuelan ID (`V/E/J`) and phone validation.
- `/cuenta` — `src/app/cuenta/page.tsx` (`RootLayout`): Customer profile dashboard, addresses, BCV calculator, and order history.
- `/cuenta/pedidos` — `src/app/cuenta/pedidos/page.tsx` (`RootLayout`): Customer order history list.

## Operational CMS Admin Routes (`/admin`)
- `/admin` — `src/app/admin/page.tsx` (`AdminLayout` with Meta Astryx Navy & Gold sidebar): Operational KPI dashboard and BCV quick sync.
- `/admin/pedidos` — `src/app/admin/pedidos/page.tsx`: Order management, payment verification, and dispatch control.
- `/admin/productos` — `src/app/admin/productos/page.tsx`: Product image manager (`.webp` upload to Supabase Storage).
- `/admin/banners` — `src/app/admin/banners/page.tsx`: Hero & promo banner editor.
- `/admin/catalogo-config` — `src/app/admin/catalogo-config/page.tsx`: Quick categories strip manager.
- `/admin/configuracion` — `src/app/admin/configuracion/page.tsx`: Global store identity, logo upload, BCV rate, GPS delivery pricing, and payment methods.

