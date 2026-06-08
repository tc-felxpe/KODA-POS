'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/pos', label: 'Punto de Venta', icon: '🛒' },
  { href: '/products', label: 'Productos', icon: '📦' },
  { href: '/inventory', label: 'Inventario', icon: '📋' },
  { href: '/sales', label: 'Ventas', icon: '💰' },
  { href: '/customers', label: 'Clientes', icon: '👥' },
  { href: '/suppliers', label: 'Proveedores', icon: '🚚' },
  { href: '/purchases', label: 'Compras', icon: '📥' },
  { href: '/expenses', label: 'Gastos', icon: '💸' },
  { href: '/cash-register', label: 'Caja', icon: '🏦' },
  { href: '/reports', label: 'Reportes', icon: '📈' },
  { href: '/users', label: 'Usuarios', icon: '🔐' },
  { href: '/settings', label: 'Configuración', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, tenant, logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('koda_token');
    if (!token && !user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7F00B2] mx-auto"></div>
          <p className="mt-4 text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#1B004B] to-[#4C007D] text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-lg flex items-center justify-center text-white font-bold text-sm">K</div>
            <span className="text-lg font-bold">KODA POS</span>
          </Link>
          <p className="text-xs text-slate-300 mt-2 truncate">{tenant?.name}</p>
          {tenant?.status === 'TRIAL' && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-[#F988FF]/20 text-[#F988FF] text-xs rounded-full">
              Prueba gratuita
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-[#7F00B2]/30 text-white border-r-2 border-[#BC4ED8]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] flex items-center justify-center text-sm font-medium">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8 bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
