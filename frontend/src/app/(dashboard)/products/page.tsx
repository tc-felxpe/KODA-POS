'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  salePrice: number;
  costPrice: number;
  minStock: number;
  active: boolean;
  category?: { name: string };
  inventory?: { stock: number }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    salePrice: '',
    costPrice: '',
    minStock: '',
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { search } });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      sku: form.sku || undefined,
      barcode: form.barcode || undefined,
      salePrice: form.salePrice ? parseFloat(form.salePrice) : 0,
      costPrice: form.costPrice ? parseFloat(form.costPrice) : 0,
      minStock: form.minStock ? parseFloat(form.minStock) : 0,
    };

    try {
      if (editing) {
        await api.patch(`/products/${editing.id}`, data);
      } else {
        await api.post('/products', data);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', sku: '', barcode: '', salePrice: '', costPrice: '', minStock: '' });
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku || '',
      barcode: product.barcode || '',
      salePrice: product.salePrice?.toString() || '',
      costPrice: product.costPrice?.toString() || '',
      minStock: product.minStock?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500">Gestiona tu catálogo de productos</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', sku: '', barcode: '', salePrice: '', costPrice: '', minStock: '' }); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código de barras</label>
                  <input value={form.barcode} onChange={(e) => setForm({...form, barcode: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio venta</label>
                  <input type="number" value={form.salePrice} onChange={(e) => setForm({...form, salePrice: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio costo</label>
                  <input type="number" value={form.costPrice} onChange={(e) => setForm({...form, costPrice: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock mínimo</label>
                  <input type="number" value={form.minStock} onChange={(e) => setForm({...form, minStock: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-700">Producto</th>
              <th className="px-6 py-3 font-medium text-slate-700">SKU</th>
              <th className="px-6 py-3 font-medium text-slate-700">Precio</th>
              <th className="px-6 py-3 font-medium text-slate-700">Stock</th>
              <th className="px-6 py-3 font-medium text-slate-700">Estado</th>
              <th className="px-6 py-3 font-medium text-slate-700 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    {product.category && <p className="text-xs text-slate-500">{product.category.name}</p>}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{product.sku || '-'}</td>
                <td className="px-6 py-4 text-slate-600">${product.salePrice?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`${(product.inventory?.[0]?.stock || 0) <= (product.minStock || 0) ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                    {product.inventory?.[0]?.stock || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${product.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {product.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Editar</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  No hay productos registrados. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
