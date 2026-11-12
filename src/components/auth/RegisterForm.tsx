'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { registerUserAction } from '@/actions/auth.actions';
import { signInWithEmail } from '@/services/auth.service';
import { translateAuthError, isValidCedulaOrRif, isValidPhone } from '@/lib/auth-errors';
import { useGpsLocator } from '@/hooks/useGpsLocator';
import { RegisterSuccessView } from './RegisterSuccessView';
import { RegisterGpsBlock } from './RegisterGpsBlock';
import { RegisterCredentialsBlock } from './RegisterCredentialsBlock';
import { RegisterIdentityFields } from './RegisterIdentityFields';

export function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [docPrefix, setDocPrefix] = useState<'V' | 'E' | 'J' | 'G'>('V');
  const [formData, setFormData] = useState({
    nombre: '',
    cedulaNumero: '',
    telefono: '',
    direccion: '',
    email: '',
    password: '',
    confirmPassword: '',
    latitud: null as number | null,
    longitud: null as number | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{
    email: string;
    nombre: string;
    emailSent?: boolean;
  } | null>(null);

  const { locatingGps, gpsStatus, detectGps } = useGpsLocator((latitud, longitud) =>
    setFormData((prev) => ({ ...prev, latitud, longitud }))
  );

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullCedula = `${docPrefix}-${formData.cedulaNumero.replace(/\D/g, '')}`;

    if (formData.nombre.trim().length < 3) return setError('Ingresa tu nombre y apellido completos.');
    if (!isValidCedulaOrRif(fullCedula)) return setError('Cédula o RIF inválido (6 a 10 dígitos).');
    if (!isValidPhone(formData.telefono)) return setError('Teléfono móvil inválido (ej: 0414-1234567).');
    if (formData.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (formData.password !== formData.confirmPassword) return setError('Las contraseñas no coinciden.');

    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const res = await registerUserAction({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        telefono: formData.telefono,
        cedula: fullCedula,
        direccion: formData.direccion,
        latitud: formData.latitud,
        longitud: formData.longitud,
        origin,
      });

      if (!res.success) {
        setError(res.error || 'No se pudo completar el registro.');
        setLoading(false);
        return;
      }

      await signInWithEmail(formData.email, formData.password).catch(() => {});
      setRegisteredSuccess({
        email: res.email || formData.email.trim().toLowerCase(),
        nombre: res.nombre || formData.nombre.trim(),
        emailSent: res.emailSent,
      });
      setLoading(false);
    } catch (err) {
      setError(translateAuthError(err, 'Error al crear la cuenta. Verifica tus datos.'));
      setLoading(false);
    }
  };

  if (registeredSuccess) {
    return (
      <RegisterSuccessView
        email={registeredSuccess.email}
        nombre={registeredSuccess.nombre}
        emailSent={registeredSuccess.emailSent}
        redirectParam={redirectParam}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3 text-red-700 font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" strokeWidth={1.5}/>
          <span>{error}</span>
        </div>
      )}

      <RegisterIdentityFields
        nombre={formData.nombre}
        docPrefix={docPrefix}
        cedulaNumero={formData.cedulaNumero}
        telefono={formData.telefono}
        onDocPrefixChange={setDocPrefix}
        onFieldChange={(field, val) => handleChange(field, val)}
      />

      <RegisterGpsBlock
        direccion={formData.direccion}
        latitud={formData.latitud}
        longitud={formData.longitud}
        locatingGps={locatingGps}
        gpsStatus={gpsStatus}
        onDireccionChange={(val) => handleChange('direccion', val)}
        onDetectGps={detectGps}
        onClearGps={() => setFormData((prev) => ({ ...prev, latitud: null, longitud: null }))}
      />

      <RegisterCredentialsBlock
        email={formData.email}
        password={formData.password}
        confirmPassword={formData.confirmPassword}
        onChange={(field, val) => handleChange(field, val)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark disabled:bg-slate-300 min-h-[46px] py-3 text-sm font-extrabold text-white transition-colors cursor-pointer mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5}/>
            <span>Registrando tu cuenta...</span>
          </>
        ) : (
          <>
            <span>Crear cuenta y comprar</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5}/>
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-600 pt-1">
        ¿Ya tienes una cuenta registrada?{' '}
        <Link href={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`} className="font-extrabold text-catador-blue hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
    </form>
  );
}
