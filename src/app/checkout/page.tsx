'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import {
  CheckoutDeliveryForm,
  CheckoutPaymentForm,
  CheckoutOrderSummary,
  DeliveryDataState,
  PaymentDataState,
} from '@/components/checkout';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const totals = useCartTotals();
  const [userId, setUserId] = useState<string | null>(null);

  const [deliveryData, setDeliveryData] = useState<DeliveryDataState>({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    tipoEntrega: 'delivery',
    direccion: '',
    zonaBarinas: 'Alto Barinas Norte / Urb. Los Corozos',
    notas: '',
  });

  // Autocompletar datos si el cliente tiene sesión iniciada
  React.useEffect(() => {
    async function loadAuthUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setDeliveryData((prev) => ({
          ...prev,
          nombre: perfil?.nombre || prev.nombre,
          cedula: perfil?.cedula || prev.cedula,
          telefono: perfil?.telefono || prev.telefono,
          direccion: perfil?.direccion || prev.direccion,
          email: user.email || prev.email,
        }));
      }
    }
    loadAuthUser();
  }, []);

  const [paymentData, setPaymentData] = useState<PaymentDataState>({
    metodoPago: 'pago_movil',
    bancoOrigen: '',
    telefonoOrigen: '',
    referencia: '',
    billetePagoUsd: 50,
    vueltoCalculadoUsd: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center max-w-md space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Tu carrito está vacío</h1>
        <p className="text-xs text-slate-500">Agrega productos desde nuestro catálogo para proceder con tu orden.</p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 rounded-xl bg-catador-blue px-5 py-2.5 text-xs font-bold text-white hover:bg-catador-blue-light transition-colors"
        >
          Explorar Catálogo
        </Link>
      </main>
    );
  }

  const handleProcessOrder = async () => {
    setErrorMessage(null);

    // Validaciones
    if (!deliveryData.nombre.trim() || !deliveryData.cedula.trim() || !deliveryData.telefono.trim()) {
      setErrorMessage('Por favor completa todos tus datos personales obligatorios (Nombre, Cédula, Teléfono).');
      return;
    }

    if (deliveryData.tipoEntrega === 'delivery' && !deliveryData.direccion.trim()) {
      setErrorMessage('Por favor indica tu dirección exacta de entrega en Barinas.');
      return;
    }

    if (paymentData.metodoPago === 'pago_movil' && (!paymentData.bancoOrigen.trim() || !paymentData.referencia.trim())) {
      setErrorMessage('Por favor ingresa el Banco Emisor y el número de referencia del Pago Móvil.');
      return;
    }

    if (paymentData.metodoPago === 'zelle' && (!paymentData.bancoOrigen.trim() || !paymentData.referencia.trim())) {
      setErrorMessage('Por favor ingresa el titular emisor y la referencia de confirmación Zelle.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        usuarioId: userId,
        clienteNombre: deliveryData.nombre,
        clienteTelefono: deliveryData.telefono,
        clienteCedula: deliveryData.cedula,
        clienteEmail: deliveryData.email,
        tipoEntrega: deliveryData.tipoEntrega,
        direccionEntrega: deliveryData.direccion,
        zonaBarinas: deliveryData.zonaBarinas,
        notas: deliveryData.notas,
        subtotalUsd: totals.subtotalUsd,
        subtotalVes: totals.subtotalVes,
        deliveryUsd: totals.shippingUsd,
        deliveryVes: totals.shippingVes,
        totalUsd: totals.totalUsd,
        totalVes: totals.totalVes,
        tasaBcv: bcvRate,
        items: items.map((it) => ({
          codArticuloFoxdata: it.product.id,
          nombreArticulo: it.product.name,
          cantidad: it.quantity,
          precioUnitarioUsd: it.product.priceUsd,
          precioUnitarioVes: Number((it.product.priceUsd * bcvRate).toFixed(2)),
          subtotalUsd: it.product.priceUsd * it.quantity,
          subtotalVes: Number((it.product.priceUsd * it.quantity * bcvRate).toFixed(2)),
          imagenUrl: it.product.images[0],
        })),
        pago: {
          metodoPago: paymentData.metodoPago,
          montoUsd: totals.totalUsd,
          montoVes: totals.totalVes,
          bancoOrigen: paymentData.bancoOrigen,
          telefonoOrigen: paymentData.telefonoOrigen || deliveryData.telefono,
          referencia: paymentData.referencia,
          comprobanteUrl: paymentData.comprobanteUrl,
          billetePagoUsd: paymentData.billetePagoUsd,
          vueltoCalculadoUsd: paymentData.vueltoCalculadoUsd,
        },
      };

      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al guardar el pedido en el servidor');
      const data = await res.json();

      if (data.success && data.order?.id) {
        clearCart();
        router.push(`/pedidos/${data.order.id}`);
      } else {
        throw new Error('Respuesta inesperada al crear el pedido');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Ocurrió un error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Checkout en Línea</h1>
          <p className="text-xs text-slate-500">Paga y realiza seguimiento en vivo sin salir de la plataforma</p>
        </div>
        <Link href="/carrito" className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al Carrito
        </Link>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Formularios (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-catador-blue text-white text-[11px] font-bold">1</span>
              Datos del Cliente y Entrega en Barinas
            </h2>
            <CheckoutDeliveryForm
              deliveryData={deliveryData}
              onChange={(updated) => setDeliveryData((prev) => ({ ...prev, ...updated }))}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-catador-blue text-white text-[11px] font-bold">2</span>
              Método de Pago Bimonetario
            </h2>
            <CheckoutPaymentForm
              totalUsd={totals.totalUsd}
              totalVes={totals.totalVes}
              bcvRate={bcvRate}
              paymentData={paymentData}
              onChange={(updated) => setPaymentData((prev) => ({ ...prev, ...updated }))}
            />
          </section>
        </div>

        {/* Columna Derecha: Resumen de Orden (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <CheckoutOrderSummary
            items={items}
            subtotalUsd={totals.subtotalUsd}
            subtotalVes={totals.subtotalVes}
            shippingUsd={totals.shippingUsd}
            shippingVes={totals.shippingVes}
            totalUsd={totals.totalUsd}
            totalVes={totals.totalVes}
            bcvRate={bcvRate}
            isSubmitting={isSubmitting}
            onProcessOrder={handleProcessOrder}
          />
        </div>
      </div>
    </main>
  );
}
