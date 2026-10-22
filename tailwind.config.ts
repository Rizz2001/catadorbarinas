import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        catador: {
          blue: {
            DEFAULT: '#00227B',       // Azul Rey Profundo (Logo, headers, navbar)
            light: '#0A38A8',         // Azul Brillante (Hover, degradados hero)
            dark: '#001754',          // Azul Noche (Bordes y contrastes)
          },
          amber: {
            DEFAULT: '#E07A1F',       // Ámbar Barril Roble (Badges, estrellas, timers)
            dark: '#C85A08',          // Ámbar Oscuro / Hover
            light: '#FFF7ED',         // Fondo sutil ámbar
          },
          discount: {
            DEFAULT: '#EF4444',       // Rojo Descuento Vibrante
            bg: '#FEF2F2',            // Fondo suave alerta/descuento
          },
          surface: {
            bg: '#F8FAFC',            // slate-50: Fondo general de la app
            card: '#FFFFFF',          // Blanco puro para tarjetas
            border: '#E2E8F0',        // slate-200: Bordes limpios
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 34, 123, 0.05), 0 1px 2px -1px rgba(0, 34, 123, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 34, 123, 0.12), 0 8px 10px -6px rgba(0, 34, 123, 0.08)',
        'deal': '0 4px 20px -2px rgba(224, 122, 31, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
