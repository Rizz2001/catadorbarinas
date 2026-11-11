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
  { step: 1, title: 'Datos y Entrega', shortTitle: 'Datos', icon: MapPin },
  { step: 2, title: 'Método de Pago', shortTitle: 'Pago', icon: CreditCard },
  { step: 3, title: 'Resumen de Orden', shortTitle: 'Resumen', icon: ClipboardCheck },
  { step: 4, title: 'Chat en Vivo', shortTitle: 'Chat', icon: MessageSquareText },
];

export function CheckoutWizardStepper({
  currentStep,
  orderCreated,
  onSelectStep,
}: CheckoutWizardStepperProps) {
  const activeStep = WIZARD_STEPS.find((item) => item.step === currentStep) || WIZARD_STEPS[0];
  const progressPct = Math.round((currentStep / WIZARD_STEPS.length) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-900">
          Paso {currentStep} de 4 · {activeStep.title}
        </span>
        <span className="font-semibold text-slate-400 tabular-nums">{progressPct}%</span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
        <div
          className="h-full rounded-full bg-catador-blue transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-1 pt-0.5">
        {WIZARD_STEPS.map(({ step, shortTitle, icon: Icon }) => {
          const isCurrent = currentStep === step;
          const isCompleted =
            currentStep > step || (step === 4 && orderCreated && currentStep === 4);
          const isClickable = !orderCreated && step < currentStep;

          return (
            <button
              key={step}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectStep(step)}
              className={cn(
                'flex items-center justify-center gap-1 py-1 text-xs transition-colors min-w-0',
                isCurrent
                  ? 'font-bold text-catador-blue'
                  : isCompleted
                  ? 'font-semibold text-emerald-700'
                  : 'font-medium text-slate-400',
                isClickable ? 'cursor-pointer hover:underline' : 'cursor-default'
              )}
            >
              {currentStep > step ? (
                <Check className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">{shortTitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
