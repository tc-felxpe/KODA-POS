'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';

/* ---------- Hook para detectar móvil ---------- */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

/* ---------- Iconos ---------- */

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="4" y1="8" x2="20" y2="8" />
    <line x1="4" y1="16" x2="20" y2="16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const GridIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const BookmarkIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const CartIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

const ChatIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const PowerIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 2v10" />
    <path d="M18.36 6.64a9 9 0 11-12.72 0" />
  </svg>
);

const PackageIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ClipboardIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const UsersIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ChartIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const StoreIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const TagIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);

const WalletIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-[#7F00B2]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
    <path d="M16 11h.01" />
    <path d="M20 7V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2" />
  </svg>
);

/* ---------- Navegación ---------- */

const mainNav = [
  { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { href: '/pos', icon: CartIcon, label: 'POS' },
];

const managementNav = [
  { href: '/products', icon: PackageIcon, label: 'Productos' },
  { href: '/inventory', icon: ClipboardIcon, label: 'Inventario' },
  { href: '/sales', icon: ChartIcon, label: 'Ventas' },
  { href: '/customers', icon: UsersIcon, label: 'Clientes' },
  { href: '/suppliers', icon: StoreIcon, label: 'Proveedores' },
  { href: '/purchases', icon: TagIcon, label: 'Compras' },
  { href: '/expenses', icon: WalletIcon, label: 'Gastos' },
  { href: '/cash-register', icon: GridIcon, label: 'Caja' },
  { href: '/reports', icon: ChartIcon, label: 'Reportes' },
];

const systemNav = [
  { href: '/users', icon: UsersIcon, label: 'Usuarios' },
  { href: '/settings', icon: SettingsIcon, label: 'Configuración' },
];

function NavGroup({ items, pathname, onClick }: { items: typeof mainNav; pathname: string; onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            onClick={onClick}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${
              active
                ? 'text-[#7F00B2]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon active={active} />
          </Link>
        );
      })}
    </div>
  );
}

/* ---------- Layout ---------- */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, tenant, logout } = useAuth();
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  /* Inicializar estado según dispositivo y preferencia guardada */
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      const saved = localStorage.getItem('koda_sidebar_open');
      setSidebarOpen(saved === null ? true : saved === 'true');
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    if (!isMobile) {
      localStorage.setItem('koda_sidebar_open', String(next));
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('koda_token') : null;
    if (!token && !user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/products/low-stock');
        setAlertCount(res.data?.length || 0);
      } catch { /* ignore */ }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F00B2] mx-auto"></div>
          <p className="mt-3 text-slate-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      {/* Overlay oscuro en móvil cuando el sidebar está abierto */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar flotante tipo cápsula */}
      <aside
        className={`
          fixed z-50 flex flex-col items-center py-5 w-16 bg-white rounded-[32px]
          shadow-[0_4px_24px_rgba(0,0,0,0.06)]
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isMobile
            ? sidebarOpen
              ? 'left-4 top-4 bottom-4 translate-x-0 opacity-100'
              : '-left-4 top-4 bottom-4 -translate-x-full opacity-0 pointer-events-none'
            : sidebarOpen
              ? 'left-4 top-4 bottom-4 translate-x-0 opacity-100'
              : 'left-4 top-4 bottom-4 -translate-x-24 opacity-0 pointer-events-none'
          }
        `}
      >
        {/* Logo */}
        <Link href="/" className="mb-6">
          <div className="w-8 h-8 rounded-full bg-[#7F00B2] flex items-center justify-center text-white font-bold text-sm">
            K
          </div>
        </Link>

        {/* Navegación */}
        <nav className="flex-1 flex flex-col items-center gap-3 w-full px-2 overflow-y-auto no-scrollbar">
          <NavGroup items={mainNav} pathname={pathname} onClick={isMobile ? () => setSidebarOpen(false) : undefined} />
          <div className="w-6 h-px bg-slate-100 my-1" />
          <NavGroup items={managementNav} pathname={pathname} onClick={isMobile ? () => setSidebarOpen(false) : undefined} />
          <div className="w-6 h-px bg-slate-100 my-1" />
          <NavGroup items={systemNav} pathname={pathname} onClick={isMobile ? () => setSidebarOpen(false) : undefined} />
        </nav>

        {/* Logout */}
        <div className="mt-3 pt-3 w-full flex justify-center">
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors duration-200"
          >
            <PowerIcon active={false} />
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div
        className={`
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarOpen && !isMobile ? 'ml-[88px]' : 'ml-0'}
        `}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 lg:px-8 lg:py-5">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 hover:text-[#7F00B2] hover:border-[#E9D5FF] transition-colors"
              title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
            >
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">KODA POS</p>
              <p className="text-xs text-slate-500">{tenant?.name || 'Mi Negocio'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notificaciones */}
            <button
              onClick={() => router.push('/products')}
              className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#7F00B2] transition-colors relative"
              title={`${alertCount} producto(s) con stock bajo`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] flex items-center justify-center text-white text-xs font-bold">
                {user.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-[#1B004B]">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="px-6 pb-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
