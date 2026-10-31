'use client';

import React from 'react';
import { MapPin, CreditCard, ClipboardCheck, MessageSquareText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CheckoutWizardStep = 1 | 2 | 3 | 4;

interface CheckoutWizardStepperProps {
  currentStep: CheckoutWizardStep;
  orderCreated: boolean;
  onSelectStep: (step: CheckoutWizardStep) => void;
}

const WIZARD_STEPS: Array<{
  step: CheckoutWizardStep;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
}> = [
  { step: 1, title: '1. Datos del Cliente', shortTitle: '1. Datos', icon: MapPin },
  { step: 2, title: '2. Método de Pago', shortTitle: '2. Pago', icon: CreditCard },
  { step: 3, title: '3. Resumen de Orden', shortTitle: '3. Resumen', icon: ClipboardCheck },
  { step: 4, title: '4. Chat en Vivo', shortTitle: '4. Chat', icon: MessageSquareText },
];

export function CheckoutWizardStepper({
  currentStep,
  orderCreated,
  onSelectStep,
}: CheckoutWizardStepperProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-2xs">
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {WIZARD_STEPS.map(({ step, title, shortTitle, icon: Icon }) => {
          const isCurrent = currentStep === step;
          const isCompleted = currentStep > step || (step === 4 && orderCreated && currentStep === 4);
          const isClickable = !orderCreated && step < currentStep;

          return (
            <button
              key={step}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectStep(step)}
              className={cn(
                'relative flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 rounded-xl p-2 sm:px-3 sm:py-2.5 text-center sm:text-left transition-all border',
                isCurrent
                  ? 'border-catador-blue bg-catador-blue text-white shadow-sm'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                  : 'border-slate-100 bg-slate-50 text-slate-400',
                isClickable ? 'cursor-pointer hover:bg-emerald-100/70' : 'cursor-default'
              )}
            >
              <div
                className={cn(
                  'flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors',
                  isCurrent
                    ? 'bg-catador-amber text-white'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200/80 text-slate-500'
                )}
              >
                {currentStep > step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>

              <div className="min-w-0">
                <span className="hidden sm:block text-xs font-extrabold truncate leading-tight">
                  {title}
                </span>
                <span className="sm:hidden block text-[10px] font-extrabold truncate leading-tight">
                  {shortTitle}
                </span>
                <span
                  className={cn(
                    'hidden md:block text-[10px] truncate',
                    isCurrent
                      ? 'text-blue-100'
                      : isCompleted
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  )}
                >
                  {step === 1 && 'Entrega y GPS'}
                  {step === 2 && 'Pago Bimonetario'}
                  {step === 3 && 'Confirmar Compra'}
                  {step === 4 && 'Atención Directa'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

