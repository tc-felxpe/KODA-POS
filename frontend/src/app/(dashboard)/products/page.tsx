'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import LabelPrintModal from '@/components/LabelPrintModal';

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }
interface Supplier { id: string; name: string; }
interface Branch { id: string; name: string; }
interface BusinessConfig {
  businessType: string;
  config: {
    label: string;
    fields: {
      key: string;
      label: string;
      type: 'text' | 'number' | 'date' | 'select';
      options?: string[];
    }[];
  };
}

interface ProductVariant {
  id?: string;
  name: string;
  sku: string;
  barcode?: string;
  salePrice: string;
  costPrice: string;
  initialStock: string;
  attributes: Record<string, string>;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  salePrice: number;
  costPrice: number;
  minStock: number;
  maxStock?: number;
  unit?: string;
  tax?: number;
  location?: string;
  imageUrl?: string;
  active: boolean;
  category?: { name: string };
  brand?: { name: string };
  supplier?: { name: string };
  inventory?: { stock: number; branch?: { name: string } }[];
  variants?: ProductVariant[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [labelProduct, setLabelProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '', sku: '', barcode: '', description: '',
    salePrice: '', costPrice: '', minStock: '', maxStock: '',
    unit: 'UNIDAD', tax: '', categoryId: '', brandId: '',
    supplierId: '', location: '', imageUrl: '', active: true,
    initialStock: '', branchId: '',
    attributes: {} as Record<string, string>,
  });

  // Variantes
  const [hasVariants, setHasVariants] = useState(false);
  const [variantAttrs, setVariantAttrs] = useState<{key: string; values: string}[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search } });
      setProducts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchOptions = async () => {
    try {
      const [catRes, brandRes, supRes, branchRes, configRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
        api.get('/suppliers'),
        api.get('/branches'),
        api.get('/tenants/business-config'),
      ]);
      setCategories(catRes.data);
      setBrands(brandRes.data);
      setSuppliers(supRes.data);
      setBranches(branchRes.data);
      setBusinessConfig(configRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProducts(); }, [search]);
  useEffect(() => { fetchOptions(); }, []);

  const resetForm = () => {
    setForm({
      name: '', sku: '', barcode: '', description: '',
      salePrice: '', costPrice: '', minStock: '', maxStock: '',
      unit: 'UNIDAD', tax: '', categoryId: '', brandId: '',
      supplierId: '', location: '', imageUrl: '', active: true,
      initialStock: '', branchId: '',
      attributes: {} as Record<string, string>,
    });
    setHasVariants(false);
    setVariantAttrs([]);
    setVariants([]);
  };

  const generateCombinations = () => {
    const validAttrs = variantAttrs.filter(a => a.key.trim() && a.values.trim());
    if (validAttrs.length === 0) return;

    const parsed = validAttrs.map(a => ({
      key: a.key.trim(),
      values: a.values.split(',').map(v => v.trim()).filter(Boolean),
    }));

    const combos: Record<string, string>[] = [];
    const recurse = (idx: number, current: Record<string, string>) => {
      if (idx === parsed.length) {
        combos.push({ ...current });
        return;
      }
      for (const val of parsed[idx].values) {
        current[parsed[idx].key] = val;
        recurse(idx + 1, current);
      }
    };
    recurse(0, {});

    const newVariants: ProductVariant[] = combos.map((combo) => {
      const nameParts = Object.values(combo);
      const name = nameParts.join(' / ');
      const baseSku = form.sku || 'VAR';
      const skuSuffix = Object.entries(combo).map(([, v]) => v).join('-');
      return {
        name,
        sku: `${baseSku}-${skuSuffix}`.toUpperCase(),
        salePrice: form.salePrice,
        costPrice: form.costPrice,
        initialStock: '',
        attributes: combo,
        active: true,
      };
    });

    setVariants(newVariants);
  };

  const updateVariant = (idx: number, field: keyof ProductVariant, value: string | boolean) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const removeVariant = (idx: number) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const addVariantAttr = () => {
    setVariantAttrs(prev => [...prev, { key: '', values: '' }]);
  };

  const updateVariantAttr = (idx: number, field: 'key' | 'values', value: string) => {
    setVariantAttrs(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  const removeVariantAttr = (idx: number) => {
    setVariantAttrs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      name: form.name,
      sku: form.sku || undefined,
      barcode: form.barcode || undefined,
      description: form.description || undefined,
      salePrice: form.salePrice ? parseFloat(form.salePrice) : 0,
      costPrice: form.costPrice ? parseFloat(form.costPrice) : 0,
      minStock: form.minStock ? parseFloat(form.minStock) : 0,
      maxStock: form.maxStock ? parseFloat(form.maxStock) : undefined,
      unit: form.unit || undefined,
      tax: form.tax ? parseFloat(form.tax) : undefined,
      categoryId: form.categoryId || undefined,
      brandId: form.brandId || undefined,
      supplierId: form.supplierId || undefined,
      location: form.location || undefined,
      imageUrl: form.imageUrl || undefined,
      active: form.active,
      attributes: form.attributes && Object.keys(form.attributes).length > 0 ? form.attributes : undefined,
      initialStock: !hasVariants && form.initialStock ? parseFloat(form.initialStock) : undefined,
      branchId: form.branchId || undefined,
    };

    if (hasVariants && variants.length > 0) {
      data.variants = variants.map(v => ({
        ...v,
        salePrice: v.salePrice ? parseFloat(v.salePrice) : undefined,
        costPrice: v.costPrice ? parseFloat(v.costPrice) : undefined,
        initialStock: v.initialStock ? parseFloat(v.initialStock) : 0,
        branchId: form.branchId || undefined,
      }));
      data.initialStock = undefined;
    }

    try {
      if (editing) {
        await api.patch(`/products/${editing.id}`, data);
      } else {
        await api.post('/products', data);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
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
      description: product.description || '',
      salePrice: product.salePrice?.toString() || '',
      costPrice: product.costPrice?.toString() || '',
      minStock: product.minStock?.toString() || '',
      maxStock: product.maxStock?.toString() || '',
      unit: product.unit || 'UNIDAD',
      tax: product.tax?.toString() || '',
      categoryId: product.category ? (product as any).categoryId || '' : '',
      brandId: product.brand ? (product as any).brandId || '' : '',
      supplierId: product.supplier ? (product as any).supplierId || '' : '',
      location: product.location || '',
      imageUrl: product.imageUrl || '',
      active: product.active,
      initialStock: '',
      branchId: '',
      attributes: (product as any).attributes ? (product as any).attributes : {} as Record<string, string>,
    });

    if (product.variants && product.variants.length > 0) {
      setHasVariants(true);
      setVariants(product.variants.map(v => ({
        ...v,
        salePrice: v.salePrice?.toString() || '',
        costPrice: v.costPrice?.toString() || '',
        initialStock: v.initialStock?.toString() || '',
      })));
    } else {
      setHasVariants(false);
      setVariants([]);
    }
    setVariantAttrs([]);

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7F00B2]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B004B]">Productos</h1>
          <p className="text-slate-500 text-sm">Gestiona tu catálogo de productos</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
          className="px-4 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white font-medium rounded-xl transition-colors text-sm"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Navegación secundaria */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        <Link href="/products" className="px-4 py-2 bg-[#1B004B] text-white rounded-xl text-sm font-medium whitespace-nowrap">Productos</Link>
        <Link href="/categories" className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium whitespace-nowrap transition-colors">Categorías</Link>
        <Link href="/brands" className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium whitespace-nowrap transition-colors">Marcas</Link>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full max-w-md px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8] focus:ring-2 focus:ring-[#F3E8FF]"
        />
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#1B004B] mb-4">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info básica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Código interno)</label>
                  <input value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código de barras</label>
                  <div className="flex gap-2">
                    <input value={form.barcode} onChange={(e) => setForm({...form, barcode: e.target.value})} className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await api.get('/products/barcode/generate');
                          setForm({...form, barcode: res.data});
                        } catch (err) { alert('Error al generar código'); }
                      }}
                      className="px-3 py-2.5 bg-[#F3E8FF] text-[#7F00B2] rounded-xl text-xs font-medium hover:bg-[#E9D5FF] whitespace-nowrap"
                    >
                      Generar
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8] resize-none" rows={2} />
                </div>
              </div>

              {/* Categoría, Marca, Proveedor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]">
                    <option value="">Sin categoría</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                  <select value={form.brandId} onChange={(e) => setForm({...form, brandId: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]">
                    <option value="">Sin marca</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                  <select value={form.supplierId} onChange={(e) => setForm({...form, supplierId: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]">
                    <option value="">Sin proveedor</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Info comercial */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio costo</label>
                  <input type="number" value={form.costPrice} onChange={(e) => setForm({...form, costPrice: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio venta</label>
                  <input type="number" value={form.salePrice} onChange={(e) => setForm({...form, salePrice: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Impuesto (%)</label>
                  <input type="number" value={form.tax} onChange={(e) => setForm({...form, tax: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
                  <select value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]">
                    <option value="UNIDAD">Unidad</option>
                    <option value="KG">Kilogramo</option>
                    <option value="GR">Gramo</option>
                    <option value="LB">Libra</option>
                    <option value="LT">Litro</option>
                    <option value="ML">Mililitro</option>
                    <option value="M">Metro</option>
                    <option value="CM">Centímetro</option>
                    <option value="PZ">Pieza</option>
                    <option value="CJ">Caja</option>
                  </select>
                </div>
              </div>

              {/* Toggle variantes */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <input
                  type="checkbox"
                  id="hasVariants"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-4 h-4 text-[#7F00B2] rounded focus:ring-[#BC4ED8]"
                />
                <label htmlFor="hasVariants" className="text-sm font-medium text-slate-700">
                  Este producto tiene variantes (talla, color, etc.)
                </label>
              </div>

              {/* Info inventario (solo si NO tiene variantes) */}
              {!hasVariants && !editing && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock inicial</label>
                    <input type="number" value={form.initialStock} onChange={(e) => setForm({...form, initialStock: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bodega</label>
                    <select value={form.branchId} onChange={(e) => setForm({...form, branchId: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]">
                      <option value="">Por defecto</option>
                      {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock mínimo</label>
                    <input type="number" value={form.minStock} onChange={(e) => setForm({...form, minStock: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock máximo</label>
                    <input type="number" value={form.maxStock} onChange={(e) => setForm({...form, maxStock: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                  </div>
                </div>
              )}

              {editing && !hasVariants && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock mínimo</label>
                    <input type="number" value={form.minStock} onChange={(e) => setForm({...form, minStock: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock máximo</label>
                    <input type="number" value={form.maxStock} onChange={(e) => setForm({...form, maxStock: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
                    <input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                  </div>
                </div>
              )}

              {/* GESTOR DE VARIANTES */}
              {hasVariants && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                  <p className="text-sm font-semibold text-[#1B004B]">Configurar variantes</p>

                  {/* Atributos */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">Define los atributos y sus valores separados por coma</p>
                    {variantAttrs.map((attr, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          placeholder="Atributo (ej: Talla)"
                          value={attr.key}
                          onChange={(e) => updateVariantAttr(idx, 'key', e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                        />
                        <input
                          placeholder="Valores (ej: S, M, L, XL)"
                          value={attr.values}
                          onChange={(e) => updateVariantAttr(idx, 'values', e.target.value)}
                          className="flex-[2] px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                        />
                        <button type="button" onClick={() => removeVariantAttr(idx)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">✕</button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addVariantAttr}
                      className="text-sm text-[#7F00B2] hover:text-[#4C007D] font-medium"
                    >
                      + Agregar atributo
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={generateCombinations}
                    className="px-4 py-2 bg-[#1B004B] text-white rounded-xl text-sm font-medium hover:bg-[#4C007D]"
                  >
                    🎲 Generar variantes
                  </button>

                  {/* Tabla de variantes */}
                  {variants.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-500">
                            <th className="text-left py-2 px-2">Variante</th>
                            <th className="text-left py-2 px-2">SKU</th>
                            <th className="text-left py-2 px-2">Barcode</th>
                            <th className="text-left py-2 px-2">Precio venta</th>
                            <th className="text-left py-2 px-2">Stock inicial</th>
                            <th className="text-left py-2 px-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {variants.map((v, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-2">
                                <input
                                  value={v.name}
                                  onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#BC4ED8]"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  value={v.sku}
                                  onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#BC4ED8]"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <div className="flex gap-1">
                                  <input
                                    value={v.barcode || ''}
                                    onChange={(e) => updateVariant(idx, 'barcode', e.target.value)}
                                    className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#BC4ED8]"
                                  />
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        const res = await api.get('/products/barcode/generate');
                                        updateVariant(idx, 'barcode', res.data);
                                      } catch (err) { alert('Error al generar código'); }
                                    }}
                                    className="px-1.5 py-1 bg-[#F3E8FF] text-[#7F00B2] rounded-lg text-[10px] font-medium hover:bg-[#E9D5FF]"
                                  >
                                    ⚡
                                  </button>
                                </div>
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="number"
                                  value={v.salePrice}
                                  onChange={(e) => updateVariant(idx, 'salePrice', e.target.value)}
                                  className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#BC4ED8]"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="number"
                                  value={v.initialStock}
                                  onChange={(e) => updateVariant(idx, 'initialStock', e.target.value)}
                                  className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#BC4ED8]"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 hover:text-red-700">✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Bodega para variantes */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Bodega para variantes</label>
                    <select value={form.branchId} onChange={(e) => setForm({...form, branchId: e.target.value})} className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]">
                      <option value="">Por defecto</option>
                      {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Estado:</span>
                <button
                  type="button"
                  onClick={() => setForm({...form, active: !form.active})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  {form.active ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Campos dinámicos según tipo de negocio */}
              {businessConfig && businessConfig.config.fields.length > 0 && (
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <p className="text-xs font-semibold text-[#7F00B2] uppercase tracking-wider mb-3">
                    {businessConfig.config.label}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {businessConfig.config.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                        {field.type === 'select' ? (
                          <select
                            value={form.attributes[field.key] || ''}
                            onChange={(e) => setForm({
                              ...form,
                              attributes: { ...form.attributes, [field.key]: e.target.value }
                            })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                          >
                            <option value="">Seleccionar</option>
                            {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={form.attributes[field.key] || ''}
                            onChange={(e) => setForm({
                              ...form,
                              attributes: { ...form.attributes, [field.key]: e.target.value }
                            })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white rounded-xl text-sm font-medium">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Producto</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">SKU</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Precio</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Stock</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Barcode</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Variantes</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600">Estado</th>
              <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-[#1B004B]">{product.name}</p>
                    <div className="flex gap-2 text-xs text-slate-400">
                      {product.category && <span>{product.category.name}</span>}
                      {product.brand && <span>• {product.brand.name}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{product.sku || '-'}</td>
                <td className="px-6 py-4 text-slate-600">${Number(product.salePrice).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`${(product.inventory?.[0]?.stock || 0) <= (product.minStock || 0) ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                    {Number(product.inventory?.[0]?.stock || 0)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{product.barcode || '-'}</td>
                <td className="px-6 py-4">
                  {product.variants && product.variants.length > 0 ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-[#F3E8FF] text-[#7F00B2]">
                      {product.variants.length} variantes
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${product.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {product.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleEdit(product)} className="text-[#7F00B2] hover:text-[#4C007D] text-sm font-medium">Editar</button>
                  <button onClick={() => setLabelProduct(product)} className="text-slate-500 hover:text-[#7F00B2] text-sm font-medium">Etiqueta</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Eliminar</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  No hay productos registrados. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de impresión de etiquetas */}
      {labelProduct && (
        <LabelPrintModal
          product={labelProduct}
          onClose={() => setLabelProduct(null)}
        />
      )}
    </div>
  );
}
