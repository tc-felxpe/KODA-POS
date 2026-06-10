'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Product {
  id: string;
  name: string;
  sku?: string;
}

interface Branch {
  id: string;
  name: string;
}

interface Movement {
  id: string;
  type: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  referenceId?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string };
  productId: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ENTRY: { label: 'Entrada', color: 'bg-green-100 text-green-700' },
  EXIT: { label: 'Salida', color: 'bg-red-100 text-red-700' },
  ADJUSTMENT: { label: 'Ajuste', color: 'bg-amber-100 text-amber-700' },
  SALE: { label: 'Venta', color: 'bg-blue-100 text-blue-700' },
  PURCHASE: { label: 'Compra', color: 'bg-purple-100 text-purple-700' },
  RETURN: { label: 'Devolución', color: 'bg-teal-100 text-teal-700' },
};

export default function InventoryPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProduct, setFilterProduct] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: '',
    branchId: '',
    type: 'ADJUSTMENT',
    quantity: '',
    reason: '',
  });

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterProduct) params.productId = filterProduct;
      if (filterType) params.type = filterType;
      if (filterStart) params.startDate = filterStart;
      if (filterEnd) params.endDate = filterEnd;
      const res = await api.get('/inventory/movements', { params });
      setMovements(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMovements(); }, [filterProduct, filterType, filterStart, filterEnd]);
  useEffect(() => { fetchProducts(); fetchBranches(); }, []);

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/adjustments', {
        ...adjustmentForm,
        quantity: parseFloat(adjustmentForm.quantity),
      });
      setShowAdjustment(false);
      setAdjustmentForm({ productId: '', branchId: '', type: 'ADJUSTMENT', quantity: '', reason: '' });
      fetchMovements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al registrar ajuste');
    }
  };

  const productMap = new Map(products.map(p => [p.id, p]));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B004B]">Kardex / Movimientos</h1>
          <p className="text-slate-500 text-sm">Historial de movimientos de inventario</p>
        </div>
        <button
          onClick={() => setShowAdjustment(true)}
          className="px-4 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white font-medium rounded-xl transition-colors text-sm"
        >
          + Ajuste de inventario
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
        >
          <option value="">Todos los productos</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
        >
          <option value="">Todos los tipos</option>
          <option value="ENTRY">Entrada</option>
          <option value="EXIT">Salida</option>
          <option value="ADJUSTMENT">Ajuste</option>
          <option value="SALE">Venta</option>
          <option value="PURCHASE">Compra</option>
          <option value="RETURN">Devolución</option>
        </select>
        <input
          type="date"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
          placeholder="Desde"
        />
        <input
          type="date"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
          placeholder="Hasta"
        />
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Fecha</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Producto</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Tipo</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Cantidad</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Stock antes</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Stock después</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Motivo</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F00B2] mx-auto" />
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  No hay movimientos registrados.
                </td>
              </tr>
            ) : (
              movements.map((m) => {
                const typeInfo = TYPE_LABELS[m.type] || { label: m.type, color: 'bg-slate-100 text-slate-600' };
                const product = productMap.get(m.productId);
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(m.createdAt).toLocaleDateString('es-CO')}
                      <br />
                      {new Date(m.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#1B004B]">{product?.name || '—'}</p>
                      {product?.sku && <p className="text-xs text-slate-400">{product.sku}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {m.type === 'EXIT' || m.type === 'SALE' ? '-' : '+'}{Number(m.quantity)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">{Number(m.stockBefore)}</td>
                    <td className="px-6 py-4 text-right font-medium text-[#1B004B]">{Number(m.stockAfter)}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">{m.reason || '—'}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {m.user ? `${m.user.firstName} ${m.user.lastName}` : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de ajuste */}
      {showAdjustment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-[#1B004B] mb-4">Ajuste de inventario</h2>
            <form onSubmit={handleAdjustment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Producto *</label>
                <select
                  value={adjustmentForm.productId}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, productId: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bodega</label>
                <select
                  value={adjustmentForm.branchId}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, branchId: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                >
                  <option value="">Por defecto</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de movimiento *</label>
                <div className="flex gap-2">
                  {[
                    { value: 'ENTRY', label: 'Entrada' },
                    { value: 'EXIT', label: 'Salida' },
                    { value: 'ADJUSTMENT', label: 'Ajuste directo' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAdjustmentForm({...adjustmentForm, type: t.value})}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border ${
                        adjustmentForm.type === t.value
                          ? 'bg-[#7F00B2] text-white border-[#7F00B2]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#BC4ED8]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {adjustmentForm.type === 'ADJUSTMENT' && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    El ajuste directo establece el stock exacto al valor ingresado.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {adjustmentForm.type === 'ADJUSTMENT' ? 'Nuevo stock total *' : 'Cantidad *'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, quantity: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo *</label>
                <input
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, reason: e.target.value})}
                  placeholder="Ej: Conteo físico, Daño, Vencimiento..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white rounded-xl text-sm font-medium">
                  Registrar ajuste
                </button>
                <button type="button" onClick={() => setShowAdjustment(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
