'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', form);
      const { token, user, tenant } = res.data;
      setAuth(user, tenant, token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Panel izquierdo - Morado */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1B004B] via-[#4C007D] to-[#1B004B] flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#BC4ED8] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7F00B2] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-xl flex items-center justify-center text-white font-bold">K</div>
            <span className="text-xl font-bold">KODA POS</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Crea tu cuenta</h2>
          <p className="text-slate-300 mb-8 max-w-sm">
            Comienza gratis y transforma la forma en que gestionas tu negocio.
          </p>
          
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="h-16 bg-gradient-to-t from-[#7F00B2] to-[#BC4ED8] rounded opacity-80"></div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="h-16 bg-gradient-to-t from-[#4C007D] to-[#7F00B2] rounded opacity-80"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-white/20 rounded w-3/4"></div>
                <div className="h-2 bg-white/20 rounded w-1/2"></div>
              </div>
            </div>
            <div className="absolute -right-2 -top-2 w-8 h-8 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-lg flex items-center justify-center text-white text-lg shadow-lg">+</div>
          </div>
          
          <div className="space-y-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-lg flex items-center justify-center">
                🏪
              </div>
              <div>
                <p className="text-xl font-bold">+3.000</p>
                <p className="text-xs text-slate-300">Negocios activos</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-lg flex items-center justify-center">
                📊
              </div>
              <div>
                <p className="text-xl font-bold">+1.2M</p>
                <p className="text-xs text-slate-300">Ventas procesadas</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-lg flex items-center justify-center">
                🛡️
              </div>
              <div>
                <p className="text-xl font-bold">99.9%</p>
                <p className="text-xs text-slate-300">Tiempo de actividad</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © 2024 KODA POS. Todos los derechos reservados.
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-xl flex items-center justify-center text-white font-bold">K</div>
              <span className="text-xl font-bold text-[#1B004B]">KODA POS</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[#1B004B] mb-1">Crear cuenta</h1>
          <p className="text-slate-500 text-sm mb-8">Completa los datos para crear tu cuenta</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1B004B] mb-1.5">Nombre completo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7F00B2]/20 focus:border-[#7F00B2] outline-none transition-all text-sm"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B004B] mb-1.5">Correo electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">✉</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7F00B2]/20 focus:border-[#7F00B2] outline-none transition-all text-sm"
                  placeholder="ejemplo@negocio.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B004B] mb-1.5">Nombre del negocio</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🏪</span>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7F00B2]/20 focus:border-[#7F00B2] outline-none transition-all text-sm"
                  placeholder="Mi Negocio S.A.S."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B004B] mb-1.5">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7F00B2]/20 focus:border-[#7F00B2] outline-none transition-all text-sm"
                  placeholder="Crea una contraseña"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Mínimo 8 caracteres con letras y números</p>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#7F00B2] focus:ring-[#7F00B2]" required />
              <span className="text-xs text-slate-500">
                Acepto los <a href="#" className="text-[#7F00B2]">Términos y Condiciones</a> y la <a href="#" className="text-[#7F00B2]">Política de Privacidad</a>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#7F00B2] to-[#BC4ED8] hover:opacity-90 text-white font-medium rounded-xl transition-opacity disabled:opacity-50 text-sm"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400">o regístrate con</span>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors text-sm text-slate-700">
              <span className="text-lg">🔍</span> Continuar con Google
            </button>
            <button className="w-full py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors text-sm text-slate-700">
              <span className="text-lg">📘</span> Continuar con Microsoft
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-[#7F00B2] hover:text-[#4C007D] font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
