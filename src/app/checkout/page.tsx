'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
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
import { resendConfirmationEmailAction } from '@/actions/auth.actions';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const baseTotals = useCartTotals();

  const [userId, setUserId] = useState<string | null>(null);
  const [profileAddress, setProfileAddress] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<CheckoutWizardStep>(1);
  const [createdOrder, setCreatedOrder] = useState<PedidoConDetalles | null>(null);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState<boolean>(true);
  const [checkoutResending, setCheckoutResending] = useState<boolean>(false);
  const [checkoutResendMsg, setCheckoutResendMsg] = useState<string | null>(null);

  const [deliveryData, setDeliveryData] = useState<DeliveryDataState>(() => {
    const saved = useDeliveryStore.getState();
    return {
      nombre: '',
      cedula: '',
      telefono: '',
      email: '',
      tipoEntrega: saved.deliveryType || 'delivery',
      direccion: saved.direccion || '',
      zonaBarinas: saved.zonaBarinas || 'Alto Barinas Norte',
      notas: '',
      latitud: saved.latitud ?? null,
      longitud: saved.longitud ?? null,
    };
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
        const confirmed = perfil?.rol === 'admin' || perfil?.correo_confirmado === true;
        setIsEmailConfirmed(Boolean(confirmed));

        const deliveryStore = useDeliveryStore.getState();
        let savedDireccion = typeof perfil?.direccion === 'string' ? perfil.direccion.trim() : '';

        if (!savedDireccion) {
          const { data: ultimoPedido } = await supabase
            .from('pedidos')
            .select('direccion_entrega')
            .eq('user_id', user.id)
            .not('direccion_entrega', 'is', null)
            .neq('direccion_entrega', '')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!active) return;
          if (typeof ultimoPedido?.direccion_entrega === 'string') {
            savedDireccion = ultimoPedido.direccion_entrega.trim();
          }
        }

        setProfileAddress(savedDireccion || null);
        deliveryStore.hydrateFromProfile({
          userId: user.id,
          direccion: savedDireccion || null,
          latitud: typeof perfil?.latitud === 'number' ? perfil.latitud : null,
          longitud: typeof perfil?.longitud === 'number' ? perfil.longitud : null,
        });
        const updatedStore = useDeliveryStore.getState();

        setDeliveryData((prev) => ({
          ...prev,
          nombre: perfil?.nombre || prev.nombre,
          cedula: perfil?.cedula || prev.cedula,
          telefono: perfil?.telefono || prev.telefono,
          direccion: prev.direccion.trim() || updatedStore.direccion || savedDireccion || '',
          zonaBarinas: updatedStore.zonaBarinas || prev.zonaBarinas,
          email: user.email || prev.email,
          latitud:
            prev.latitud ??
            updatedStore.latitud ??
            (typeof perfil?.latitud === 'number' ? perfil.latitud : null),
          longitud:
            prev.longitud ??
            updatedStore.longitud ??
            (typeof perfil?.longitud === 'number' ? perfil.longitud : null),
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
    if (paymentData.metodoPago === 'transferencia_bancaria' && (!paymentData.bancoOrigen.trim() || !paymentData.referencia.trim())) {
      setErrorMessage('Por favor ingresa el Banco Emisor y los dígitos de referencia del comprobante de transferencia.');
      return;
    }
    if (paymentData.metodoPago === 'zelle' && (!paymentData.bancoOrigen.trim() || !paymentData.referencia.trim())) {
      setErrorMessage('Por favor ingresa el titular de la cuenta y la referencia de confirmación Zelle.');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResendCheckoutEmail = async () => {
    if (!deliveryData.email) return;
    setCheckoutResending(true);
    setCheckoutResendMsg(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const res = await resendConfirmationEmailAction(deliveryData.email, origin);
      if (res.success) {
        setCheckoutResendMsg(res.message || 'Enlace reenviado.');
      } else {
        setCheckoutResendMsg(res.error || 'Error al reenviar.');
      }
    } catch {
      setCheckoutResendMsg('Error de conexión.');
    } finally {
      setCheckoutResending(false);
    }
  };

  const handleProcessOrder = async () => {
    setErrorMessage(null);
    if (!userId) {
      setErrorMessage('Debes registrarte o iniciar sesión para poder procesar tu compra.');
      return;
    }

    if (!isEmailConfirmed) {
      setErrorMessage(
        'Debes confirmar tu correo electrónico antes de realizar tu pedido. Revisa tu bandeja de entrada o haz clic en reenviar enlace.'
      );
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
        if (deliveryData.tipoEntrega === 'delivery' && deliveryData.direccion.trim()) {
          useDeliveryStore.getState().applyProfileSavedLocation({
            userId,
            direccion: deliveryData.direccion,
            latitud: deliveryData.latitud ?? null,
            longitud: deliveryData.longitud ?? null,
          });
          if (userId) {
            void supabase
              .from('perfiles')
              .update({
                direccion: deliveryData.direccion.trim(),
                latitud: deliveryData.latitud ?? null,
                longitud: deliveryData.longitud ?? null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);
          }
        }
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
    <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8 pb-24 md:pb-8 space-y-4 sm:space-y-5 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {currentStep === 4 ? 'Sala de Atención en Vivo' : 'Finalizar Compra'}
        </h1>
        {currentStep < 4 && (
          <Link
            href="/carrito"
            className="inline-flex items-center gap-1 text-xs font-semibold text-catador-blue hover:underline shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al carrito
          </Link>
        )}
      </div>

      {/* Barra de Progreso Compacta */}
      <CheckoutWizardStepper
        currentStep={currentStep}
        orderCreated={Boolean(createdOrder)}
        onSelectStep={(step) => {
          setErrorMessage(null);
          setCurrentStep(step);
        }}
      />

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-700 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PASO 1: DATOS DEL CLIENTE Y UBICACIÓN */}
      {currentStep === 1 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <h2 className="text-sm font-black text-slate-900">1. Datos y Ubicación</h2>
            <span className="text-xs font-bold text-slate-500 tabular-nums">
              Subtotal: <strong className="text-slate-900">{formatUsd(baseTotals.subtotalUsd)}</strong>
            </span>
          </div>

          <CheckoutDeliveryForm
            deliveryData={deliveryData}
            onChange={(updated) => {
              const store = useDeliveryStore.getState();
              if (updated.tipoEntrega) store.setDeliveryType(updated.tipoEntrega);
              if (updated.direccion !== undefined && updated.latitud === undefined) {
                store.setManualAddress(updated.direccion);
              }
              if (updated.zonaBarinas !== undefined) {
                store.clearGpsLocation();
                store.setZoneWithFallbackCoords(updated.zonaBarinas, null, null);
              }
              if (typeof updated.latitud === 'number' && typeof updated.longitud === 'number') {
                store.setGpsLocation(updated.latitud, updated.longitud, updated.direccion);
              }
              setDeliveryData((prev) => ({ ...prev, ...updated }));
            }}
            deliveryQuote={deliveryQuote}
            bcvRate={bcvRate}
            profileAddress={profileAddress}
            storeAddress={storeConfig?.direccion_fisica}
          />

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all cursor-pointer"
            >
              <span>Continuar al Pago</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </section>
      )}

      {/* PASO 2: MÉTODO DE PAGO Y PAGO */}
      {currentStep === 2 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
            <h2 className="text-sm font-black text-slate-900">Método de Pago</h2>
            <span className="text-xs font-bold text-catador-blue tabular-nums">
              {formatUsd(finalTotalUsd)} · {formatVes(finalTotalVes)}
            </span>
          </div>

          <CheckoutPaymentForm
            totalUsd={finalTotalUsd}
            totalVes={finalTotalVes}
            bcvRate={bcvRate}
            paymentData={paymentData}
            onChange={(updated) => setPaymentData((prev) => ({ ...prev, ...updated }))}
          />

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Atrás</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromStep2}
              className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all cursor-pointer"
            >
              <span>Revisar Orden</span>
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
          totalUsd={finalTotalUsd}
          totalVes={finalTotalVes}
          bcvRate={bcvRate}
          deliveryQuote={deliveryQuote}
          isSubmitting={isSubmitting}
          isEmailConfirmed={isEmailConfirmed}
          onResendConfirmEmail={handleResendCheckoutEmail}
          resendingEmail={checkoutResending}
          resendEmailMsg={checkoutResendMsg}
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
