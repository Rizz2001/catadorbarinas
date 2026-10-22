import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header, CartDrawer, Footer } from '@/components/layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <div className="flex-1">{children}</div>
        <CartDrawer />
        <Footer />
      </body>
    </html>
  );
}
