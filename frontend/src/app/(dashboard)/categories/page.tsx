'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  parent?: { name: string } | null;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', parentId: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories', { params: { search } });
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      parentId: form.parentId || undefined,
    };
    try {
      if (editing) {
        await api.patch(`/categories/${editing.id}`, data);
      } else {
        await api.post('/categories', data);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', parentId: '' });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, parentId: cat.parentId || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7F00B2]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B004B]">Categorías</h1>
          <p className="text-slate-500 text-sm">Organiza tus productos por categorías y subcategorías</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', parentId: '' }); }}
          className="px-4 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white font-medium rounded-xl transition-colors text-sm"
        >
          + Nueva categoría
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
          className="w-full max-w-md px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8] focus:ring-2 focus:ring-[#F3E8FF]"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-[#1B004B] mb-4">{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría padre (opcional)</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                >
                  <option value="">Ninguna (categoría principal)</option>
                  {categories
                    .filter((c) => c.id !== editing?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white rounded-xl text-sm font-medium">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Nombre</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Padre</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Productos</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-[#1B004B]">{cat.name}</td>
                <td className="px-6 py-4 text-slate-500">{cat.parent?.name || '-'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-[#F3E8FF] text-[#7F00B2] rounded-lg text-xs font-medium">
                    {cat._count?.products || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleEdit(cat)} className="text-[#7F00B2] hover:text-[#4C007D] text-sm font-medium">Editar</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Eliminar</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No hay categorías registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
