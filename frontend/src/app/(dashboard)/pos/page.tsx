'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import api from '@/lib/axios';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

/* ---------- Tipos ---------- */
interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  salePrice: number;
  imageUrl: string | null;
  category: { id: string; name: string } | null;
  inventory: { stock: number } | null;
}

/* ---------- Iconos ---------- */
const SearchIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const CartIcon = ({ count }: { count: number }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ---------- Componente principal ---------- */
export default function POSPage() {
  const { user } = useAuth();
  const cart = useCart();

  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [observations, setObservations] = useState('');

  /* Cargar productos */
  const fetchProducts = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search: q } });
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts('');
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

  /* Categorías únicas de los productos cargados */
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.category) map.set(p.category.id, p.category.name);
    });
    return Array.from(map.entries());
  }, [products]);

  /* Productos filtrados por categoría */
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category?.id === selectedCategory);
  }, [products, selectedCategory]);

  /* Agregar producto al carrito */
  const handleAddProduct = (product: Product) => {
    cart.addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku || '',
      barcode: product.barcode || '',
      imageUrl: product.imageUrl,
      salePrice: Number(product.salePrice),
    });
  };

  /* Totales */
  const subtotal = cart.getSubtotal();
  const totalDiscount = cart.getTotalDiscount();
  const totalTax = cart.getTotalTax();
  const total = cart.getTotal();
  const itemCount = cart.getItemCount();

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-4">
      {/* ========== PANEL IZQUIERDO: PRODUCTOS ========== */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-slate-100">
        {/* Header de búsqueda */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, SKU o código de barras..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8] focus:ring-2 focus:ring-[#F3E8FF] transition-all"
            />
          </div>

          {/* Categorías rápidas */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-[#1B004B] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos
              </button>
              {categories.map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === id
                      ? 'bg-[#1B004B] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F00B2]"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <p className="text-sm">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className="group flex flex-col bg-white border border-slate-100 rounded-xl p-3 hover:shadow-md hover:border-[#E9D5FF] transition-all text-left"
                >
                  <div className="aspect-square bg-slate-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#1B004B] line-clamp-2 leading-tight">{product.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{product.sku || product.barcode || 'Sin código'}</p>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-sm font-bold text-[#7F00B2]">
                      ${Number(product.salePrice).toLocaleString()}
                    </span>
                    <span className="w-7 h-7 rounded-full bg-[#1B004B] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlusIcon />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== PANEL DERECHO: CARRITO (desktop) ========== */}
      <div className="hidden lg:flex w-[380px] flex-col bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-[#1B004B]">Carrito de venta</h2>
          <p className="text-xs text-slate-400">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <CartIcon count={0} />
              <p className="text-sm mt-2">El carrito está vacío</p>
              <p className="text-xs">Toca un producto para agregarlo</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.productId} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 text-lg">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    '📦'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B004B] truncate">{item.name}</p>
                  <p className="text-xs text-slate-400">${item.salePrice.toLocaleString()} c/u</p>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#BC4ED8] hover:text-[#7F00B2] transition-colors"
                    >
                      <MinusIcon />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-[#1B004B]">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#BC4ED8] hover:text-[#7F00B2] transition-colors"
                    >
                      <PlusIcon />
                    </button>
                    <button
                      onClick={() => cart.removeItem(item.productId)}
                      className="ml-auto w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-red-200 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {/* Descuento e impuesto por línea */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      placeholder="Desc."
                      value={item.discount || ''}
                      onChange={(e) => cart.updateDiscount(item.productId, Number(e.target.value), item.discountType)}
                      className="w-16 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-[#BC4ED8]"
                    />
                    <select
                      value={item.discountType}
                      onChange={(e) => cart.updateDiscount(item.productId, item.discount, e.target.value as 'value' | 'percent')}
                      className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-[#BC4ED8]"
                    >
                      <option value="value">$</option>
                      <option value="percent">%</option>
                    </select>
                    <input
                      type="number"
                      placeholder="IVA %"
                      value={item.tax || ''}
                      onChange={(e) => cart.updateTax(item.productId, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-[#BC4ED8]"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totales y observaciones */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Observaciones..."
            rows={2}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#BC4ED8] resize-none"
          />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Descuento</span>
                <span>-${totalDiscount.toLocaleString()}</span>
              </div>
            )}
            {totalTax > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Impuestos</span>
                <span>+${totalTax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#1B004B] pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>

          <button
            disabled={cart.items.length === 0}
            className="w-full py-3 bg-[#1B004B] text-white rounded-xl font-medium text-sm hover:bg-[#4C007D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continuar al pago
          </button>
        </div>
      </div>

      {/* ========== BOTÓN FLOTANTE CARRITO (móvil) ========== */}
      <button
        onClick={() => setShowCartMobile(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#1B004B] text-white rounded-full shadow-lg shadow-purple-300/40 flex items-center justify-center"
      >
        <CartIcon count={itemCount} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* ========== DRAWER CARRITO (móvil) ========== */}
      {showCartMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-[#1B004B]">Carrito</h2>
              <p className="text-xs text-slate-400">{itemCount} productos</p>
            </div>
            <button onClick={() => setShowCartMobile(false)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
              <CloseIcon />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <CartIcon count={0} />
                <p className="text-sm mt-2">El carrito está vacío</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.productId} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 text-lg">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B004B] truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">${item.salePrice.toLocaleString()} c/u</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500"
                      >
                        <MinusIcon />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500"
                      >
                        <PlusIcon />
                      </button>
                      <button
                        onClick={() => cart.removeItem(item.productId)}
                        className="ml-auto w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-red-400"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totales */}
          <div className="p-4 border-t border-slate-100 space-y-3">
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observaciones..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
            />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Descuento</span>
                  <span>-${totalDiscount.toLocaleString()}</span>
                </div>
              )}
              {totalTax > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Impuestos</span>
                  <span>+${totalTax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-[#1B004B] pt-2 border-t border-slate-100">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
            <button
              disabled={cart.items.length === 0}
              className="w-full py-3.5 bg-[#1B004B] text-white rounded-xl font-medium disabled:opacity-40"
            >
              Continuar al pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
