import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header, CartDrawer, BottomNav, Footer } from '@/components/layout';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#00227B',
};

export const metadata: Metadata = {
  title: 'Gran Catador | Distribuidora & Bodegón del Catador Barinas',
  description:
    'E-commerce oficial de Gran Catador en Barinas. Los mejores licores, víveres y charcutería con precios bimonetarios en Dólares ($ USD) y Bolívares (Bs. BCV). Delivery rápido en Barinas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-clip">
        <Header />
        <div className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
        <CartDrawer />
        <BottomNav />
        <Footer />
      </body>
    </html>
  );
}
