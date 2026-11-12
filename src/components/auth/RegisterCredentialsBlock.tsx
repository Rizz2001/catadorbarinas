'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface RegisterCredentialsBlockProps {
  email: string;
  password: string;
  confirmPassword: string;
  onChange: (field: 'email' | 'password' | 'confirmPassword', value: string) => void;
}

export function RegisterCredentialsBlock({
  email,
  password,
  confirmPassword,
  onChange,
}: RegisterCredentialsBlockProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <div>
        <label className="block font-extrabold text-slate-700 mb-1.5">Correo Electrónico *</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-4 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 focus:outline-none focus:border-catador-blue"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-extrabold text-slate-700 mb-1.5">Contraseña *</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-10 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 focus:outline-none focus:border-catador-blue font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              aria-label="Mostrar u ocultar contraseña"
            >
              {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5}/> : <Eye className="h-4 w-4" strokeWidth={1.5}/>}
            </button>
          </div>
        </div>

        <div>
          <label className="block font-extrabold text-slate-700 mb-1.5">Confirmar Contraseña *</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              placeholder="Repite tu contraseña"
              className="w-full rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-10 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 focus:outline-none focus:border-catador-blue font-mono"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              aria-label="Mostrar u ocultar confirmación"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5}/> : <Eye className="h-4 w-4" strokeWidth={1.5}/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

