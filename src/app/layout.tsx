import type { Metadata } from 'next';
import './globals.css';
import { Header, CartDrawer, BottomNav, Footer } from '@/components/layout';

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
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
        <Header />
        <div className="flex-1 pb-16 md:pb-0">{children}</div>
        <CartDrawer />
        <BottomNav />
        <Footer />
      </body>
    </html>
  );
}
