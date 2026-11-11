# Extractable Components Catalog

## Layout Components
### Header
- Source: `src/components/layout/Header.tsx` (`HeaderTopBar.tsx`, `HeaderMain.tsx`, `HeaderNav.tsx`)
- Category: `layout`
- Description: Sticky 3-bar storefront header with CMS logo, pill search bar, golden BCV rate pill, and Midnight Navy department bar.
- Extractable props: `activeDepartment` (string, default: "licores"), `cartCount` (number, default: 0)
- Hardcoded: CMS logo image URL, BCV pill format, department links, CSS classes.

### BottomNav
- Source: `src/components/layout/BottomNav.tsx`
- Category: `layout`
- Description: Mobile 5-tab navigation bar (`Inicio`, `Catálogo`, `Ofertas`, `Carrito`, `Mi Cuenta`) with Navy droplet active indicator.
- Extractable props: `activeTab` (string, default: "inicio"), `cartBadgeCount` (number, default: 0)
- Hardcoded: Tab labels, Lucide icons, droplet active geometry.

### Footer
- Source: `src/components/layout/Footer.tsx`
- Category: `layout`
- Description: Deep Navy (`#001754`) 4-column footer with CMS logo, Barinas store address, and bimonetary payment badges.
- Extractable props: `showCopyright` (boolean, default: true)
- Hardcoded: Store address (`C.C. Ciudad Catador Local N1`), department links, payment pills.

## Basic Components
### ProductCard
- Source: `src/components/ecommerce/ProductCard.tsx`
- Category: `basic`
- Description: Opción C uniform product card with top-right circular `+` button, `Unidad | Caja` segmented pill, dual USD/VES pricing, and solid Navy `- 1 +` pill stepper.
- Extractable props: `isInCart` (boolean, default: false), `quantity` (number, default: 1), `saleType` (string, default: "unit")
- Hardcoded: Card surface, badge styles, button geometry.

### HeroBentoCards
- Source: `src/components/ecommerce/HeroBentoCards.tsx`
- Category: `basic`
- Description: 4 overlapping white Bento cards (`Ofertas Especiales`, `Delivery GPS Barinas`, `Compra por Caja Cerrada`, `Edición Destacada`) with circular `>` action buttons.
- Extractable props: `activeSlideIndex` (number, default: 0)
- Hardcoded: 4-column Bento grid layout, countdown boxes, circular `>` buttons.

