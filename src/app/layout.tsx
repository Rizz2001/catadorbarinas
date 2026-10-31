import type { Metadata, Viewport } from 'next';
import './globals.css';
import {
  Header,
  CartDrawer,
  BottomNav,
  Footer,
  CookieConsentBanner,
} from '@/components/layout';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#00227B',
};

export const metadata: Metadata = {
  title: {
    default: 'Gran Catador | Distribuidora & Bodegón del Catador en Barinas',
    template: '%s | Gran Catador Barinas',
  },
  description:
    'Tienda online oficial de Gran Catador / Distribuidora Bodegón del Catador C.A. en Barinas. Compra licores, cervezas, refrescos, hielo y víveres por unidad o por caja con precios en $ USD y Bs. BCV. Cotizador de delivery GPS en tiempo real.',
  keywords: [
    'Gran Catador Barinas',
    'Bodegón en Barinas',
    'Licorería en Barinas',
    'Comprar licores por caja Barinas',
    'Delivery de licores y víveres Barinas',
    'Distribuidora Bodegón del Catador',
    'Precios BCV Barinas',
  ],
  openGraph: {
    title: 'Gran Catador | Distribuidora & Bodegón del Catador Barinas',
    description:
      'Compra por unidad o caja cerrada con inventario en tiempo real y precios duales ($ USD y Bs. BCV). Delivery express en Barinas.',
    locale: 'es_VE',
    type: 'website',
    siteName: 'Gran Catador Barinas',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LiquorStore', 'GroceryStore'],
    name: 'Gran Catador - Distribuidora Bodegón del Catador C.A.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Alberto Arvelo Torrealba',
      addressLocality: 'Barinas',
      addressRegion: 'Barinas',
      addressCountry: 'VE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 8.6226,
      longitude: -70.2075,
    },
    openingHours: 'Mo-Su 08:00-21:00',
    priceRange: '$$',
    currenciesAccepted: 'USD, VES',
    paymentAccepted: 'Pago Móvil, Zelle, Efectivo USD, Punto de Venta',
  };

  return (
    <html lang="es" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-clip">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
        <Header />
        <div className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </div>
        <CartDrawer />
        <CookieConsentBanner />
        <BottomNav />
        <Footer />
      </body>
    </html>
  );
}
