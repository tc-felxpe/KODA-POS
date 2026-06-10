'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Supplier { id: string; name: string; }
interface Branch { id: string; name: string; }
interface Product { id: string; name: string; }

interface PurchaseDetail {
  id: string;
  product: { id: string; name: string };
  quantity: number;
  unitCost: number;
  subtotal: number;
}

interface Purchase {
  id: string;
  supplier: { name: string };
  branch: { name: string };
  invoiceNumber?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  notes?: string;
  createdAt: string;
  details: PurchaseDetail[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  RECEIVED: { label: 'Recibida', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelada', color: 'bg-slate-100 text-slate-600' },
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const [form, setForm] = useState({
    supplierId: '',
    branchId: '',
    invoiceNumber: '',
    tax: '',
    notes: '',
    status: 'PENDING',
    items: [] as { productId: string; quantity: string; unitCost: string }[],
  });

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/purchases');
      setPurchases(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchOptions = async () => {
    try {
      const [supRes, brRes, prodRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/branches'),
        api.get('/products'),
      ]);
      setSuppliers(supRes.data);
      setBranches(brRes.data);
      setProducts(prodRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPurchases(); fetchOptions(); }, []);

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { productId: '', quantity: '1', unitCost: '' }] }));
  };

  const updateItem = (idx: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  const removeItem = (idx: number) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = form.items
      .filter(i => i.productId && parseFloat(i.quantity) > 0 && parseFloat(i.unitCost) >= 0)
      .map(i => ({ productId: i.productId, quantity: parseFloat(i.quantity), unitCost: parseFloat(i.unitCost) }));

    if (items.length === 0) { alert('Agrega al menos un producto válido'); return; }

    try {
      await api.post('/purchases', {
        supplierId: form.supplierId,
        branchId: form.branchId,
        invoiceNumber: form.invoiceNumber || undefined,
        tax: form.tax ? parseFloat(form.tax) : 0,
        notes: form.notes || undefined,
        status: form.status,
        items,
      });
      setShowForm(false);
      setForm({ supplierId: '', branchId: '', invoiceNumber: '', tax: '', notes: '', status: 'PENDING', items: [] });
      fetchPurchases();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/purchases/${id}`, { status });
      fetchPurchases();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar');
    }
  };

  const subtotal = form.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);
  const tax = form.tax ? (subtotal * parseFloat(form.tax)) / 100 : 0;
  const total = subtotal + tax;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B004B]">Compras</h1>
          <p className="text-slate-500 text-sm">Registro de compras a proveedores</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm({ supplierId: '', branchId: '', invoiceNumber: '', tax: '', notes: '', status: 'PENDING', items: [] }); }}
          className="px-4 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white font-medium rounded-xl transition-colors text-sm"
        >
          + Nueva compra
        </button>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#1B004B] mb-4">Nueva compra</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor *</label>
                  <select value={form.supplierId} onChange={e => setForm({...form, supplierId: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" required>
                    <option value="">Seleccionar</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bodega *</label>
                  <select value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" required>
                    <option value="">Seleccionar</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Factura #</label>
                  <input value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]">
                    <option value="PENDING">Pendiente</option>
                    <option value="RECEIVED">Recibida</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Productos</label>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]">
                        <option value="">Producto</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input type="number" min="1" placeholder="Cant" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                      <input type="number" min="0" placeholder="Costo" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', e.target.value)} className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 px-2">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={addItem} className="text-sm text-[#7F00B2] font-medium hover:underline">+ Agregar producto</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Impuesto (%)</label>
                  <input type="number" min="0" value={form.tax} onChange={e => setForm({...form, tax: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                  <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 flex justify-between text-sm">
                <span className="text-slate-600">Subtotal: <strong>${subtotal.toLocaleString()}</strong></span>
                <span className="text-slate-600">Impuesto: <strong>${tax.toLocaleString()}</strong></span>
                <span className="text-[#1B004B] font-bold">Total: ${total.toLocaleString()}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white rounded-xl text-sm font-medium">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detalle de compra */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1B004B]">Detalle de compra</h2>
              <button onClick={() => setSelectedPurchase(null)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">✕</button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <p><span className="text-slate-500">Proveedor:</span> {selectedPurchase.supplier?.name}</p>
              <p><span className="text-slate-500">Bodega:</span> {selectedPurchase.branch?.name}</p>
              {selectedPurchase.invoiceNumber && <p><span className="text-slate-500">Factura:</span> {selectedPurchase.invoiceNumber}</p>}
              <p><span className="text-slate-500">Fecha:</span> {new Date(selectedPurchase.createdAt).toLocaleDateString('es-CO')}</p>
              <p><span className="text-slate-500">Estado:</span> <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[selectedPurchase.status]?.color}`}>{STATUS_LABELS[selectedPurchase.status]?.label}</span></p>
            </div>
            <table className="w-full text-sm mb-4">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-right">Cant</th><th className="px-3 py-2 text-right">Costo</th><th className="px-3 py-2 text-right">Subtotal</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedPurchase.details.map(d => (
                  <tr key={d.id}>
                    <td className="px-3 py-2">{d.product?.name}</td>
                    <td className="px-3 py-2 text-right">{Number(d.quantity)}</td>
                    <td className="px-3 py-2 text-right">${Number(d.unitCost).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">${Number(d.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between text-sm font-medium border-t border-slate-100 pt-3">
              <span className="text-slate-600">Subtotal: ${Number(selectedPurchase.subtotal).toLocaleString()}</span>
              <span className="text-slate-600">Impuesto: ${Number(selectedPurchase.tax).toLocaleString()}</span>
              <span className="text-[#1B004B]">Total: ${Number(selectedPurchase.total).toLocaleString()}</span>
            </div>
            {selectedPurchase.status === 'PENDING' && (
              <button
                onClick={() => handleUpdateStatus(selectedPurchase.id, 'RECEIVED')}
                className="w-full mt-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium"
              >
                ✅ Marcar como recibida
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Fecha</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Proveedor</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Bodega</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Factura</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Total</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Estado</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F00B2] mx-auto" /></td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No hay compras registradas.</td></tr>
            ) : purchases.map(p => {
              const status = STATUS_LABELS[p.status] || { label: p.status, color: 'bg-slate-100 text-slate-600' };
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString('es-CO')}</td>
                  <td className="px-6 py-4 font-medium text-[#1B004B]">{p.supplier?.name}</td>
                  <td className="px-6 py-4 text-slate-600">{p.branch?.name}</td>
                  <td className="px-6 py-4 text-slate-500">{p.invoiceNumber || '-'}</td>
                  <td className="px-6 py-4 text-right font-medium">${Number(p.total).toLocaleString()}</td>
                  <td className="px-6 py-4"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedPurchase(p)} className="text-[#7F00B2] hover:text-[#4C007D] text-sm font-medium">Ver</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
