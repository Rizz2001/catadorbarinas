import type { Metadata, Viewport } from 'next';
import './globals.css';
import {
  Header,
  CartDrawer,
  BottomNav,
  Footer,
  CookieConsentBanner,
} from '@/components/layout';
import { getStoreConfigServer } from '@/services/cms.server';
import {
  APP_CONFIG,
  OFFICIAL_LOGO_VERSIONED,
  OFFICIAL_OG_IMAGE,
} from '@/constants/config';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#001754',
};

export async function generateMetadata(): Promise<Metadata> {
  const storeConfig = await getStoreConfigServer();
  const storeName = storeConfig?.nombre_tienda || APP_CONFIG.name;
  const ogDescription =
    'Compra por unidad o caja cerrada con inventario en tiempo real y precios duales ($ USD y Bs. BCV). Delivery express en Barinas.';

  return {
    metadataBase: new URL(APP_CONFIG.siteUrl),
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description:
      'Tienda online oficial de EL CATADOR. en Barinas. Compra licores, cervezas, refrescos, hielo y víveres por unidad o por caja con precios en $ USD y Bs. BCV. Cálculo automático de delivery por GPS en tiempo real.',
    icons: {
      icon: [{ url: OFFICIAL_LOGO_VERSIONED, type: 'image/png' }],
      shortcut: [OFFICIAL_LOGO_VERSIONED],
      apple: [{ url: OFFICIAL_LOGO_VERSIONED, type: 'image/png' }],
    },
    keywords: [
      'EL CATADOR.',
      'El Catador Barinas',
      'Gran Catador Barinas',
      'Bodegón en Barinas',
      'Licorería en Barinas',
      'Comprar licores por caja Barinas',
      'Delivery de licores y víveres Barinas',
      'Precios BCV Barinas',
    ],
    openGraph: {
      title: storeName,
      description: ogDescription,
      url: APP_CONFIG.siteUrl,
      locale: 'es_VE',
      type: 'website',
      siteName: storeName,
      images: [{ ...OFFICIAL_OG_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description: ogDescription,
      images: [
        {
          url: OFFICIAL_LOGO_VERSIONED,
          alt: APP_CONFIG.logoAlt,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LiquorStore', 'GroceryStore'],
    name: 'EL CATADOR.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. San Silvestre Detras de la Ciudad Deportiva, C.C Ciudad Catador Local N1',
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
      <body className="min-h-full flex flex-col bg-[#F7F8FA] text-slate-900 overflow-x-clip">
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
