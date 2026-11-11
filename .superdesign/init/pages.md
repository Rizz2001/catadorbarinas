# Page Dependency Trees (`src/app/`)

## `/` (Home Page)
Entry: `src/app/page.tsx`
Dependencies:
- `src/components/ecommerce/HeroBanner.tsx`
  - `src/components/ecommerce/HeroBentoCards.tsx`
  - `src/components/ecommerce/QuickCategoriesStrip.tsx`
- `src/components/ecommerce/WeeklyTrendsBento.tsx`
  - `src/components/ecommerce/ProductCard.tsx`
    - `src/components/ecommerce/ProductCardTopActions.tsx`
    - `src/components/ecommerce/ProductPurchaseControls.tsx`
    - `src/components/ecommerce/ProductStockBadge.tsx`
- `src/components/ecommerce/FeaturedDealsBox.tsx`
  - `src/components/ecommerce/ProductCard.tsx`
- `src/components/ecommerce/PromoBannersGrid.tsx`
- `src/components/ecommerce/TrustValueBar.tsx`
- `src/components/ecommerce/LiveCatalogSection.tsx`
  - `src/components/catalog/CatalogStickyNav.tsx`
  - `src/components/ecommerce/ProductCard.tsx`

## `/catalogo/[[...slug]]` (Catalog Page)
Entry: `src/app/catalogo/[[...slug]]/page.tsx`
Dependencies:
- `src/components/catalog/CatalogBrowser.tsx`
  - `src/components/catalog/CatalogHeader.tsx`
  - `src/components/catalog/CatalogStickyNav.tsx`
  - `src/components/catalog/CatalogFiltersBar.tsx`
  - `src/components/ecommerce/ProductCard.tsx`

## `/producto/[id]` (Product Detail Page)
Entry: `src/app/producto/[id]/page.tsx`
Dependencies:
- `src/components/ecommerce/ProductDetailView.tsx`
  - `src/components/ecommerce/ProductDeliveryEstimator.tsx`
  - `src/components/ecommerce/ProductCard.tsx`

## `/checkout` (Checkout Page)
Entry: `src/app/checkout/page.tsx`
Dependencies:
- `src/components/checkout/DeliveryZoneSelector.tsx`
- `src/components/checkout/PaymentMethodSelector.tsx`
- `src/components/checkout/CheckoutOrderSummary.tsx`

## `/cuenta` (Customer Account Dashboard)
Entry: `src/app/cuenta/page.tsx`
Dependencies:
- `src/components/account/AccountOrdersPreview.tsx`
- `src/components/account/AccountAddressesTab.tsx`
- `src/components/account/AccountProfileForm.tsx`
- `src/components/account/AccountQuickCalculator.tsx`

