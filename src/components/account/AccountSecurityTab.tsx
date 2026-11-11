'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { updatePassword } from '@/services/auth.service';

export function AccountSecurityTab() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="h-5 w-5 text-catador-blue" />
          <span>Seguridad y Contraseña de Acceso</span>
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Actualiza tu clave de acceso de manera rápida y segura.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>¡Tu contraseña ha sido actualizada con éxito!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 font-bold">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
            Nueva Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[46px] rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-10 py-2 text-base md:text-sm text-slate-900 focus:outline-none focus:border-catador-blue font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres recomendados.</p>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[46px] rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-4 py-2 text-base md:text-sm text-slate-900 focus:outline-none focus:border-catador-blue font-mono"
            />
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark disabled:bg-slate-300 px-7 py-3 min-h-[46px] font-extrabold text-sm text-white transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            <span>{loading ? 'Actualizando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
