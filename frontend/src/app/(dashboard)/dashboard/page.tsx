'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  todaySales: number;
  monthSales: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  openCashRegister: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 1250000,
    monthSales: 15800000,
    totalProducts: 342,
    lowStockProducts: 8,
    totalCustomers: 156,
    openCashRegister: true,
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
          openCashRegister: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Ventas Hoy', value: `$${stats.todaySales.toLocaleString()}`, sub: '+12.5% vs ayer', color: 'from-[#7F00B2] to-[#BC4ED8]' },
    { label: 'Órdenes', value: '156', sub: '+5.2% vs ayer', color: 'from-[#4C007D] to-[#7F00B2]' },
    { label: 'Productos', value: stats.totalProducts.toString(), sub: '+3 nuevos', color: 'from-[#BC4ED8] to-[#F988FF]' },
    { label: 'Clientes', value: stats.totalCustomers.toString(), sub: '+15.2% vs ayer', color: 'from-[#1B004B] to-[#4C007D]' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7F00B2]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B004B]">Dashboard</h1>
        <p className="text-slate-500">Resumen de tu negocio hoy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{card.label}</p>
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                📊
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1B004B]">{card.value}</p>
            <p className="text-xs text-green-600 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-[#1B004B] mb-4">Ventas por día</h2>
          <div className="flex items-end gap-2 h-48">
            {[45, 70, 55, 85, 60, 95, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-gradient-to-t from-[#7F00B2] to-[#BC4ED8] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" 
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-[10px] text-slate-400">{['Lun','Mar','Mie','Jue','Vie','Sab','Dom'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-[#1B004B] mb-4">Ventas por categoría</h2>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F3E8FF" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7F00B2" strokeWidth="3" strokeDasharray="40, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#BC4ED8" strokeWidth="3" strokeDasharray="30, 100" strokeDashoffset="-40" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F988FF" strokeWidth="3" strokeDasharray="20, 100" strokeDashoffset="-70" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4C007D" strokeWidth="3" strokeDasharray="10, 100" strokeDashoffset="-90" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#1B004B]">$4.25M</p>
                  <p className="text-[10px] text-slate-400">Total</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Alimentos', value: '40%', color: 'bg-[#7F00B2]' },
              { label: 'Bebidas', value: '30%', color: 'bg-[#BC4ED8]' },
              { label: 'Postres', value: '20%', color: 'bg-[#F988FF]' },
              { label: 'Otros', value: '10%', color: 'bg-[#4C007D]' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-slate-600">{item.label}</span>
                </div>
                <span className="text-slate-900 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-[#1B004B] mb-4">Productos más vendidos</h2>
          <div className="space-y-3">
            {[
              { name: 'Coca Cola 400ml', qty: 45, total: 180000, img: '🥤' },
              { name: 'Pan Bimbo', qty: 32, total: 128000, img: '🍞' },
              { name: 'Arroz Diana 1kg', qty: 28, total: 140000, img: '🍚' },
              { name: 'Aceite Girasol', qty: 22, total: 176000, img: '🫒' },
              { name: 'Leche Algarra', qty: 20, total: 100000, img: '🥛' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-[#7F00B2]/10 to-[#BC4ED8]/10 rounded-lg flex items-center justify-center text-sm">{item.img}</span>
                  <span className="text-sm text-slate-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1B004B]">{item.qty} unid.</p>
                  <p className="text-xs text-slate-500">${item.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-[#1B004B] mb-4">Últimas ventas</h2>
          <div className="space-y-3">
            {[
              { id: '#VEN-00125', client: 'Ana López', total: 125000, status: 'Completada' },
              { id: '#VEN-00124', client: 'Carlos Ruiz', total: 86000, status: 'Completada' },
              { id: '#VEN-00123', client: 'María Pérez', total: 210000, status: 'Completada' },
              { id: '#VEN-00122', client: 'Juan Gómez', total: 64000, status: 'Pendiente' },
            ].map((sale, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1B004B]">{sale.id}</p>
                  <p className="text-xs text-slate-500">{sale.client}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1B004B]">${sale.total.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sale.status === 'Completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
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
