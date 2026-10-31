'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { convertUsdToVes } from '@/lib/currency';
import { calculateSmartDeliveryQuote } from '@/lib/delivery';
import { getEffectivePriceUsd, getUnitsPerPurchaseMode } from '@/lib/inventory';
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
  const storeConfig = useStoreConfigStore((state) => state.config);
  const baseTotals = useCartTotals();
  const [userId, setUserId] = useState<string | null>(null);

  const [deliveryData, setDeliveryData] = useState<DeliveryDataState>({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    tipoEntrega: 'delivery',
    direccion: '',
    zonaBarinas: 'Alto Barinas Norte',
    notas: '',
    latitud: null,
    longitud: null,
  });

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

  // Cotización dinámica de delivery según GPS / Zona + Volumen de Cajas/Unidades
  const deliveryQuote = useMemo(() => {
    return calculateSmartDeliveryQuote({
      items,
      subtotalUsd: baseTotals.subtotalUsd,
      deliveryType: deliveryData.tipoEntrega,
      userLat: deliveryData.latitud,
      userLng: deliveryData.longitud,
      zonaBarinas: deliveryData.zonaBarinas,
      storeConfig,
    });
  }, [
    items,
    baseTotals.subtotalUsd,
    deliveryData.tipoEntrega,
    deliveryData.latitud,
    deliveryData.longitud,
    deliveryData.zonaBarinas,
    storeConfig,
  ]);

  const shippingUsd = deliveryQuote.shippingUsd;
  const shippingVes = convertUsdToVes(shippingUsd, bcvRate);
  const finalTotalUsd = Number((baseTotals.subtotalUsd + shippingUsd).toFixed(2));
  const finalTotalVes = convertUsdToVes(finalTotalUsd, bcvRate);

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
        <p className="text-xs text-slate-500">
          Agrega productos desde nuestro catálogo para proceder con tu orden.
        </p>
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

    if (!deliveryData.nombre.trim() || !deliveryData.cedula.trim() || !deliveryData.telefono.trim()) {
      setErrorMessage('Por favor completa todos tus datos personales obligatorios (Nombre, Cédula, Teléfono).');
      return;
    }

    if (deliveryData.tipoEntrega === 'delivery' && !deliveryData.direccion.trim()) {
      setErrorMessage('Por favor indica tu dirección exacta de entrega o detecta tu ubicación GPS.');
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
      const gpsNote =
        deliveryData.latitud && deliveryData.longitud
          ? ` | GPS: https://maps.google.com/?q=${deliveryData.latitud},${deliveryData.longitud} (${deliveryQuote.distanceKm}km - ${deliveryQuote.transportType})`
          : '';

      const payload = {
        usuarioId: userId,
        clienteNombre: deliveryData.nombre,
        clienteTelefono: deliveryData.telefono,
        clienteCedula: deliveryData.cedula,
        clienteEmail: deliveryData.email,
        tipoEntrega: deliveryData.tipoEntrega,
        direccionEntrega: deliveryData.direccion,
        zonaBarinas: deliveryData.zonaBarinas,
        notas: `${deliveryData.notas || ''}${gpsNote}`.trim(),
        latitudEntrega: deliveryData.latitud ?? null,
        longitudEntrega: deliveryData.longitud ?? null,
        distanciaKm: deliveryQuote.distanceKm,
        tipoTransporte: deliveryQuote.transportType,
        subtotalUsd: baseTotals.subtotalUsd,
        subtotalVes: baseTotals.subtotalVes,
        deliveryUsd: shippingUsd,
        deliveryVes: shippingVes,
        totalUsd: finalTotalUsd,
        totalVes: finalTotalVes,
        tasaBcv: bcvRate,
        items: items.map((it) => {
          const mode = it.purchaseMode || 'unidad';
          const effectivePriceUsd = getEffectivePriceUsd(it.product, mode);
          const unitsPerBox = getUnitsPerPurchaseMode(it.product, mode);
          const totalUnitsDiscounted = it.quantity * unitsPerBox;

          return {
            codArticuloFoxdata: it.product.id,
            nombreArticulo: it.product.name,
            cantidad: it.quantity,
            modalidadCompra: mode,
            unidadesPorCaja: unitsPerBox,
            unidadesTotalesDescontadas: totalUnitsDiscounted,
            precioUnitarioUsd: effectivePriceUsd,
            precioUnitarioVes: Number((effectivePriceUsd * bcvRate).toFixed(2)),
            subtotalUsd: Number((effectivePriceUsd * it.quantity).toFixed(2)),
            subtotalVes: Number((effectivePriceUsd * it.quantity * bcvRate).toFixed(2)),
            imagenUrl: it.product.images[0],
          };
        }),
        pago: {
          metodoPago: paymentData.metodoPago,
          montoUsd: finalTotalUsd,
          montoVes: finalTotalVes,
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el pedido en el servidor');
      }

      if (data.success && data.order?.id) {
        clearCart();
        router.push(`/pedidos/${data.order.id}`);
      } else {
        throw new Error('Respuesta inesperada al crear el pedido');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Ocurrió un error al procesar el pedido.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Checkout y Cotización en Línea
          </h1>
          <p className="text-xs text-slate-500">
            Cotización automática por GPS y volumen (Motorizado o Vehículo de Carga)
          </p>
        </div>
        <Link
          href="/carrito"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
        >
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
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-catador-blue text-white text-[11px] font-bold">
                1
              </span>
              Datos del Cliente y Ubicación GPS de Entrega
            </h2>
            <CheckoutDeliveryForm
              deliveryData={deliveryData}
              onChange={(updated) => setDeliveryData((prev) => ({ ...prev, ...updated }))}
              deliveryQuote={deliveryQuote}
              bcvRate={bcvRate}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-catador-blue text-white text-[11px] font-bold">
                2
              </span>
              Método de Pago Bimonetario
            </h2>
            <CheckoutPaymentForm
              totalUsd={finalTotalUsd}
              totalVes={finalTotalVes}
              bcvRate={bcvRate}
              paymentData={paymentData}
              onChange={(updated) => setPaymentData((prev) => ({ ...prev, ...updated }))}
            />
          </section>
        </div>

        <div className="lg:col-span-5 sticky top-20">
          <CheckoutOrderSummary
            items={items}
            subtotalUsd={baseTotals.subtotalUsd}
            subtotalVes={baseTotals.subtotalVes}
            shippingUsd={shippingUsd}
            shippingVes={shippingVes}
            totalUsd={finalTotalUsd}
            totalVes={finalTotalVes}
            bcvRate={bcvRate}
            deliveryQuote={deliveryQuote}
            isSubmitting={isSubmitting}
            onProcessOrder={handleProcessOrder}
          />
        </div>
      </div>
    </main>
  );
}
