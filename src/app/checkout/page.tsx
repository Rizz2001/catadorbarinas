'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { convertUsdToVes, formatUsd, formatVes } from '@/lib/currency';
import { calculateSmartDeliveryQuote } from '@/lib/delivery';
import { getEffectivePriceUsd, getUnitsPerPurchaseMode } from '@/lib/inventory';
import {
  CheckoutDeliveryForm,
  CheckoutPaymentForm,
  CheckoutWizardStepper,
  CheckoutWizardStep,
  CheckoutStepSummary,
  CheckoutStepLiveChat,
  CheckoutAuthGate,
  DeliveryDataState,
  PaymentDataState,
} from '@/components/checkout';
import { PedidoConDetalles } from '@/types';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const baseTotals = useCartTotals();

  const [userId, setUserId] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<CheckoutWizardStep>(1);
  const [createdOrder, setCreatedOrder] = useState<PedidoConDetalles | null>(null);

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
    let active = true;
    async function loadAuthUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (user) {
        setUserId(user.id);
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!active) return;
        setDeliveryData((prev) => ({
          ...prev,
          nombre: perfil?.nombre || prev.nombre,
          cedula: perfil?.cedula || prev.cedula,
          telefono: perfil?.telefono || prev.telefono,
          direccion: perfil?.direccion || prev.direccion,
          email: user.email || prev.email,
        }));
      }
      setAuthChecking(false);
    }
    loadAuthUser();
    return () => {
      active = false;
    };
  }, []);

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

  if (items.length === 0 && !createdOrder) {
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

  if (!authChecking && !userId) {
    return (
      <CheckoutAuthGate
        itemCount={baseTotals.itemCount}
        subtotalUsd={baseTotals.subtotalUsd}
        subtotalVes={baseTotals.subtotalVes}
      />
    );
  }

  const handleNextFromStep1 = () => {
    setErrorMessage(null);
    if (!deliveryData.nombre.trim() || !deliveryData.cedula.trim() || !deliveryData.telefono.trim()) {
      setErrorMessage('Por favor completa tus datos obligatorios: Nombre, Cédula y Teléfono.');
      return;
    }
    if (deliveryData.tipoEntrega === 'delivery' && !deliveryData.direccion.trim()) {
      setErrorMessage('Por favor indica tu dirección exacta de entrega o usa el botón de Ubicación GPS.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    setErrorMessage(null);
    if (paymentData.metodoPago === 'pago_movil' && (!paymentData.bancoOrigen.trim() || !paymentData.referencia.trim())) {
      setErrorMessage('Por favor ingresa el Banco Emisor y los últimos dígitos de referencia del Pago Móvil.');
      return;
    }
    if (paymentData.metodoPago === 'zelle' && (!paymentData.bancoOrigen.trim() || !paymentData.referencia.trim())) {
      setErrorMessage('Por favor ingresa el titular de la cuenta y la referencia de confirmación Zelle.');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProcessOrder = async () => {
    setErrorMessage(null);
    if (!userId) {
      setErrorMessage('Debes registrarte o iniciar sesión para poder procesar tu compra.');
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
          return {
            codArticuloFoxdata: it.product.id,
            nombreArticulo: it.product.name,
            cantidad: it.quantity,
            modalidadCompra: mode,
            unidadesPorCaja: unitsPerBox,
            unidadesTotalesDescontadas: it.quantity * unitsPerBox,
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
      if (!res.ok) throw new Error(data.error || 'Error al guardar el pedido en el servidor');

      if (data.success && data.order) {
        setCreatedOrder(data.order as PedidoConDetalles);
        setCurrentStep(4);
        clearCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Respuesta inesperada al crear el pedido');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ocurrió un error al procesar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {currentStep === 4 ? 'Sala de Atención en Vivo' : 'Checkout Paso a Paso'}
          </h1>
          <p className="text-xs text-slate-500">
            {currentStep === 1 && 'Paso 1 de 4: Completa tus datos y ubicación de entrega'}
            {currentStep === 2 && 'Paso 2 de 4: Selecciona tu método de pago bimonetario'}
            {currentStep === 3 && 'Paso 3 de 4: Verifica el resumen de tu orden'}
            {currentStep === 4 && 'Paso 4 de 4: Coordina tu pedido en tiempo real con el administrador'}
          </p>
        </div>
        {currentStep < 4 && (
          <Link
            href="/carrito"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Carrito
          </Link>
        )}
      </div>

      {/* Barra de Progreso de los 4 Pasos */}
      <CheckoutWizardStepper
        currentStep={currentStep}
        orderCreated={Boolean(createdOrder)}
        onSelectStep={(step) => {
          setErrorMessage(null);
          setCurrentStep(step);
        }}
      />

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PASO 1: DATOS DEL CLIENTE Y ENTREGA */}
      {currentStep === 1 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              1. Datos del Cliente y Ubicación de Entrega
            </h2>
            <span className="text-xs font-bold text-catador-blue">
              Subtotal: {formatUsd(baseTotals.subtotalUsd)}
            </span>
          </div>

          <CheckoutDeliveryForm
            deliveryData={deliveryData}
            onChange={(updated) => setDeliveryData((prev) => ({ ...prev, ...updated }))}
            deliveryQuote={deliveryQuote}
            bcvRate={bcvRate}
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light px-6 py-3.5 text-sm font-extrabold text-white shadow-md transition-all cursor-pointer"
            >
              <span>Siguiente: Método de Pago</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* PASO 2: MÉTODO DE PAGO Y PAGO */}
      {currentStep === 2 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              2. Método de Pago y Registro de Pago
            </h2>
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-extrabold text-catador-blue">
              Total con Delivery: {formatUsd(finalTotalUsd)} • {formatVes(finalTotalVes)}
            </div>
          </div>

          <CheckoutPaymentForm
            totalUsd={finalTotalUsd}
            totalVes={finalTotalVes}
            bcvRate={bcvRate}
            paymentData={paymentData}
            onChange={(updated) => setPaymentData((prev) => ({ ...prev, ...updated }))}
          />

          <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-extrabold text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Atrás: Datos del Cliente</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromStep2}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light px-6 py-3.5 text-sm font-extrabold text-white shadow-md transition-all cursor-pointer"
            >
              <span>Siguiente: Resumen de la Orden</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* PASO 3: RESUMEN DE LA ORDEN */}
      {currentStep === 3 && (
        <CheckoutStepSummary
          items={items}
          deliveryData={deliveryData}
          paymentData={paymentData}
          subtotalUsd={baseTotals.subtotalUsd}
          subtotalVes={baseTotals.subtotalVes}
          shippingUsd={shippingUsd}
          shippingVes={shippingVes}
          totalUsd={finalTotalUsd}
          totalVes={finalTotalVes}
          bcvRate={bcvRate}
          deliveryQuote={deliveryQuote}
          isSubmitting={isSubmitting}
          onEditStep={(step) => setCurrentStep(step)}
          onProcessOrder={handleProcessOrder}
        />
      )}

      {/* PASO 4: CHAT EN VIVO Y SEGUIMIENTO */}
      {currentStep === 4 && createdOrder && (
        <CheckoutStepLiveChat initialOrder={createdOrder} userId={userId} />
      )}
    </main>
  );
}
