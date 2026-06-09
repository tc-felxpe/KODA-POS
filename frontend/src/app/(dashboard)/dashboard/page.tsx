'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  todaySales: number;
  monthSales: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  totalOrders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 4250000,
    monthSales: 15800000,
    totalProducts: 1250,
    lowStockProducts: 8,
    totalCustomers: 530,
    totalOrders: 156,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats({
          todaySales: 4250000,
          monthSales: 15800000,
          totalProducts: 1250,
          lowStockProducts: 8,
          totalCustomers: 530,
          totalOrders: 156,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Ventas Hoy', value: `$${stats.todaySales.toLocaleString()}`, sub: '+12.5% vs ayer', icon: '💰', color: 'from-[#7F00B2] to-[#BC4ED8]' },
    { label: 'Órdenes', value: stats.totalOrders.toString(), sub: '+5.2% vs ayer', icon: '📋', color: 'from-[#4C007D] to-[#7F00B2]' },
    { label: 'Productos', value: stats.totalProducts.toString(), sub: '+3 nuevos', icon: '📦', color: 'from-[#BC4ED8] to-[#F988FF]' },
    { label: 'Clientes', value: stats.totalCustomers.toString(), sub: '+15.2% vs ayer', icon: '👥', color: 'from-[#1B004B] to-[#4C007D]' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7F00B2]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B004B]">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen de tu negocio hoy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-slate-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-[#1B004B]">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-lg shadow-sm`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-[#1B004B]">Ventas por día</h2>
            <select className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 outline-none">
              <option>Esta semana</option>
              <option>Semana pasada</option>
            </select>
          </div>
          <div className="flex items-end justify-between gap-3 h-56 px-2">
            {[
              { day: 'Lun', value: 45 },
              { day: 'Mar', value: 70 },
              { day: 'Mie', value: 55 },
              { day: 'Jue', value: 85 },
              { day: 'Vie', value: 60 },
              { day: 'Sab', value: 95 },
              { day: 'Dom', value: 75 },
            ].map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex justify-center">
                  <div 
                    className="w-10 bg-gradient-to-t from-[#7F00B2] to-[#BC4ED8] rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-300"
                    style={{ height: `${item.value * 2}px` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Donut */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-[#1B004B] mb-4">Ventas por categoría</h2>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F3E8FF" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7F00B2" strokeWidth="3" strokeDasharray="40, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#BC4ED8" strokeWidth="3" strokeDasharray="30, 100" strokeDashoffset="-40" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F988FF" strokeWidth="3" strokeDasharray="20, 100" strokeDashoffset="-70" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4C007D" strokeWidth="3" strokeDasharray="10, 100" strokeDashoffset="-90" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-base font-bold text-[#1B004B]">$4.25M</p>
                  <p className="text-[10px] text-slate-400">Total</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Alimentos', value: '40%', color: 'bg-[#7F00B2]' },
              { label: 'Bebidas', value: '30%', color: 'bg-[#BC4ED8]' },
              { label: 'Postres', value: '20%', color: 'bg-[#F988FF]' },
              { label: 'Otros', value: '10%', color: 'bg-[#4C007D]' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                  <span className="text-slate-600">{item.label}</span>
                </div>
                <span className="text-[#1B004B] font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-[#1B004B] mb-5">Productos más vendidos</h2>
          <div className="space-y-4">
            {[
              { name: 'Raspberry Tart', qty: 45, total: 180000, img: '🍰' },
              { name: 'Lemon Tart', qty: 32, total: 128000, img: '🍋' },
              { name: 'Chocolate Cake', qty: 28, total: 140000, img: '🍫' },
              { name: 'Fruit Tart', qty: 22, total: 176000, img: '🫐' },
              { name: 'Mini Chocolate', qty: 20, total: 100000, img: '🧁' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">
                    {item.img}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1B004B]">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.qty} unidades</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#1B004B]">${item.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-[#1B004B] mb-5">Últimas ventas</h2>
          <div className="space-y-3">
            {[
              { id: '#VEN-00125', client: 'Ana López', total: 125000, status: 'Completada' },
              { id: '#VEN-00124', client: 'Carlos Ruiz', total: 86000, status: 'Completada' },
              { id: '#VEN-00123', client: 'María Pérez', total: 210000, status: 'Completada' },
              { id: '#VEN-00122', client: 'Juan Gómez', total: 64000, status: 'Pendiente' },
              { id: '#VEN-00121', client: 'Laura Díaz', total: 156000, status: 'Completada' },
            ].map((sale, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#7F00B2]/10 to-[#BC4ED8]/10 rounded-lg flex items-center justify-center text-[#7F00B2] text-xs font-bold">
                    {sale.client[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1B004B]">{sale.id}</p>
                    <p className="text-xs text-slate-400">{sale.client}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1B004B]">${sale.total.toLocaleString()}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${sale.status === 'Completada' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
