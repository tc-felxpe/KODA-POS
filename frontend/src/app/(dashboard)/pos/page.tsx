'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import BarcodeScanner from '@/components/BarcodeScanner';
import PaymentModal from '@/components/PaymentModal';

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
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SlidersIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-[#1B004B]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/* ---------- Componente principal ---------- */
export default function POSPage() {
  const { user, tenant } = useAuth();
  const cart = useCart();

  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [showSuspended, setShowSuspended] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [showClientCreate, setShowClientCreate] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  /* Escáner USB/Bluetooth: captura cualquier input cuando el search tiene focus */
  useEffect(() => {
    const input = searchRef.current;
    if (!input) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      /* Los lectores de código de barras envían Enter al final */
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        handleBarcodeScan(input.value.trim());
      }
    };

    input.addEventListener('keydown', handleKeyDown);
    return () => input.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBarcodeScan = (code: string) => {
    setSearch(code);
    fetchProducts(code);
  };

  /* Cargar clientes */
  const fetchCustomers = useCallback(async (q: string) => {
    try {
      const res = await api.get('/customers', { params: { search: q } });
      setCustomers(res.data);
    } catch {
      setCustomers([]);
    }
  }, []);

  /* Finalizar venta */
  const handleFinishSale = async (payments: any[]) => {
    try {
      await api.post('/sales', {
        customerId: cart.client?.id,
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.salePrice,
          discount: i.discountType === 'percent' ? (i.salePrice * i.quantity * i.discount) / 100 : i.discount * i.quantity,
          tax: ((i.salePrice * i.quantity - (i.discountType === 'percent' ? (i.salePrice * i.quantity * i.discount) / 100 : i.discount * i.quantity)) * i.tax) / 100,
        })),
        payments: payments.map((p) => ({
          paymentMethodId: p.paymentMethodId,
          amount: p.amount,
          reference: p.reference,
        })),
        subtotal: cart.getSubtotal(),
        discount: cart.getTotalDiscount() + cart.getGlobalDiscount(),
        tax: cart.getTotalTax(),
        total: cart.getTotal(),
        notes: cart.observations,
      });
      cart.clearCart();
      setShowPayment(false);
      setSaleSuccess(true);
      setTimeout(() => setSaleSuccess(false), 3000);
      fetchProducts('');
    } catch (err) {
      alert('Error al registrar la venta');
    }
  };

  useEffect(() => {
    fetchCustomers('');
  }, [fetchCustomers]);

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

  /* Categorías únicas */
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.category) map.set(p.category.id, p.category.name);
    });
    return Array.from(map.entries());
  }, [products]);

  /* Productos filtrados */
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category?.id === selectedCategory);
  }, [products, selectedCategory]);

  /* Agregar al carrito */
  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      firstName: (form as any).firstName.value,
      lastName: (form as any).lastName.value,
      email: (form as any).email.value || null,
      phone: (form as any).phone.value || null,
      taxId: (form as any).document.value || null,
    };
    setCreatingClient(true);
    try {
      const res = await api.post('/customers', data);
      cart.setClient({
        id: res.data.id,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        email: res.data.email,
        phone: res.data.phone,
        document: res.data.taxId,
        balance: Number(res.data.balance) || 0,
      });
      setShowClientCreate(false);
      fetchCustomers('');
    } finally {
      setCreatingClient(false);
    }
  };

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
  const globalDiscount = cart.getGlobalDiscount();
  const totalTax = cart.getTotalTax();
  const total = cart.getTotal();
  const itemCount = cart.getItemCount();

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-4">
      {/* ========== ÁREA CENTRAL: PRODUCTOS ========== */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#7F00B2] tracking-wide">Items</p>
              <button className="flex items-center gap-1 text-2xl font-bold text-[#1B004B]">
                Productos
                <ChevronDownIcon />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon />
                </div>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-48 sm:w-64 pl-10 pr-10 py-2.5 bg-white border-none rounded-2xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#F3E8FF] transition-all"
                />
                <button
                  onClick={() => setShowScanner(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
                  title="Escanear con cámara"
                >
                  <CameraIcon />
                </button>
              </div>
              <button className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
                <SlidersIcon />
              </button>
            </div>
          </div>

          {/* Categorías */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`shrink-0 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === ''
                    ? 'bg-[#1B004B] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Todos
              </button>
              {categories.map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`shrink-0 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === id
                      ? 'bg-[#1B004B] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {name}
                </button>
              ))}
              <button className="shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>

        {/* Grid productos */}
        <div className="flex-1 overflow-y-auto pb-4">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-slate-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🧁</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#1B004B] line-clamp-1">{product.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-[#1B004B]">
                      ${Number(product.salePrice).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="w-8 h-8 rounded-full bg-[#1B004B] text-white flex items-center justify-center hover:bg-[#4C007D] transition-colors"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== PANEL DERECHO: CURRENT ORDER (desktop) ========== */}
      <div className="hidden lg:flex w-[340px] xl:w-[380px] flex-col bg-white rounded-3xl shadow-sm p-5">
        <h2 className="text-xl font-bold text-[#1B004B] mb-4">Current Order</h2>

        {/* Cliente */}
        <div className="mb-5 pb-4 border-b border-slate-100">
          {cart.client ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] flex items-center justify-center text-white text-sm font-bold">
                {cart.client.firstName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1B004B] truncate">
                  {cart.client.firstName} {cart.client.lastName}
                </p>
                {cart.client.document && <p className="text-xs text-slate-400">CC: {cart.client.document}</p>}
                {cart.client.balance > 0 && <p className="text-xs text-red-500">Saldo: ${cart.client.balance.toLocaleString()}</p>}
              </div>
              <button
                onClick={() => cart.clearClient()}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1B004B]">Cliente general</p>
                <p className="text-xs text-slate-400">Venta rápida sin registrar</p>
              </div>
              <button
                onClick={() => setShowClientSelect(true)}
                className="px-3 py-1.5 bg-[#F3E8FF] text-[#7F00B2] rounded-lg text-xs font-medium hover:bg-[#E9D5FF] transition-colors"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <p className="text-xs">El carrito está vacío</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">🧁</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B004B] truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 font-medium">${item.salePrice.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <MinusIcon />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-[#1B004B]">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totales */}
        {/* Acciones del carrito */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
          <button
            onClick={() => setShowPromotions(true)}
            disabled={cart.items.length === 0}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 disabled:opacity-40 transition-colors"
          >
            Promociones
          </button>
          <button
            onClick={() => cart.suspendSale()}
            disabled={cart.items.length === 0}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 disabled:opacity-40 transition-colors"
          >
            Suspender
          </button>
          {cart.suspendedSales.length > 0 && (
            <button
              onClick={() => setShowSuspended(true)}
              className="relative flex-1 py-2.5 bg-[#F3E8FF] text-[#7F00B2] rounded-xl text-xs font-medium hover:bg-[#E9D5FF] transition-colors"
            >
              Recuperar
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#7F00B2] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cart.suspendedSales.length}
              </span>
            </button>
          )}
        </div>

        {/* Descuento global */}
        {(cart.globalDiscount > 0 || showPromotions) && (
          <div className="flex gap-2 mt-3">
            <input
              type="number"
              placeholder="Desc. global"
              value={cart.globalDiscount || ''}
              onChange={(e) => cart.setGlobalDiscount(Number(e.target.value), cart.globalDiscountType)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#BC4ED8]"
            />
            <select
              value={cart.globalDiscountType}
              onChange={(e) => cart.setGlobalDiscount(cart.globalDiscount, e.target.value as 'value' | 'percent')}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#BC4ED8]"
            >
              <option value="value">$</option>
              <option value="percent">%</option>
            </select>
          </div>
        )}

        {/* Totales */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span className="font-medium text-[#1B004B]">${subtotal.toLocaleString()}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Desc. por producto</span>
              <span className="font-medium">-${totalDiscount.toLocaleString()}</span>
            </div>
          )}
          {globalDiscount > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Desc. global</span>
              <span className="font-medium">-${globalDiscount.toLocaleString()}</span>
            </div>
          )}
          {totalTax > 0 && (
            <div className="flex justify-between text-sm text-slate-500">
              <span>Impuestos</span>
              <span className="font-medium text-[#1B004B]">${totalTax.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-[#1B004B] pt-2">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
          <button
            disabled={cart.items.length === 0}
            className="w-full py-3.5 mt-3 bg-[#7F00B2] text-white rounded-full font-medium text-sm hover:bg-[#4C007D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-purple-200/50"
          >
            Continue
          </button>
        </div>
      </div>

      {/* ========== BOTÓN FLOTANTE CARRITO (móvil) ========== */}
      <button
        onClick={() => setShowCartMobile(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#7F00B2] text-white rounded-full shadow-lg shadow-purple-300/40 flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* ========== DRAWER CARRITO (móvil) ========== */}
      {showCartMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-xl font-bold text-[#1B004B]">Current Order</h2>
            <button
              onClick={() => setShowCartMobile(false)}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <svg className="w-12 h-12 mb-2 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                <p className="text-sm">El carrito está vacío</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">🧁</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B004B] truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 font-medium">${item.salePrice.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                    >
                      <MinusIcon />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 border-t border-slate-100 space-y-3">
            {/* Acciones */}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowCartMobile(false); setShowPromotions(true); }}
                disabled={cart.items.length === 0}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium disabled:opacity-40"
              >
                Promociones
              </button>
              <button
                onClick={() => { cart.suspendSale(); setShowCartMobile(false); }}
                disabled={cart.items.length === 0}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium disabled:opacity-40"
              >
                Suspender
              </button>
            </div>

            {/* Descuento global móvil */}
            {cart.globalDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Desc. global ({cart.globalDiscount}{cart.globalDiscountType === 'percent' ? '%' : '$'})</span>
                <span className="font-medium">-${globalDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-[#1B004B]">${subtotal.toLocaleString()}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Desc. por producto</span>
                <span className="font-medium">-${totalDiscount.toLocaleString()}</span>
              </div>
            )}
            {totalTax > 0 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>Impuestos</span>
                <span className="font-medium text-[#1B004B]">${totalTax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-[#1B004B] pt-2">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <button
              onClick={() => { setShowCartMobile(false); setShowPayment(true); }}
              disabled={cart.items.length === 0}
              className="w-full py-4 mt-2 bg-[#7F00B2] text-white rounded-full font-medium disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ========== MODAL VENTAS SUSPENDIDAS ========== */}
      {showSuspended && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1B004B]">Ventas suspendidas</h3>
              <button
                onClick={() => setShowSuspended(false)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {cart.suspendedSales.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">No hay ventas suspendidas</p>
              ) : (
                cart.suspendedSales.map((sale) => (
                  <div key={sale.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#7F00B2] text-xs font-bold">
                      {sale.items.length}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1B004B]">
                        {sale.items.length} producto{sale.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(sale.createdAt).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <button
                      onClick={() => { cart.resumeSale(sale.id); setShowSuspended(false); }}
                      className="px-4 py-2 bg-[#7F00B2] text-white rounded-xl text-xs font-medium hover:bg-[#4C007D] transition-colors"
                    >
                      Recuperar
                    </button>
                    <button
                      onClick={() => cart.deleteSuspendedSale(sale.id)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-red-400 hover:border-red-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL PROMOCIONES ========== */}
      {showPromotions && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1B004B]">Promociones</h3>
              <button
                onClick={() => setShowPromotions(false)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Descuento por porcentaje</p>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30].map((p) => (
                  <button
                    key={p}
                    onClick={() => { cart.setGlobalDiscount(p, 'percent'); setShowPromotions(false); }}
                    className="py-3 bg-slate-50 rounded-xl text-sm font-medium text-[#1B004B] hover:bg-[#F3E8FF] hover:text-[#7F00B2] transition-colors"
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider pt-2">Descuento por valor</p>
              <div className="grid grid-cols-2 gap-2">
                {[5000, 10000, 15000, 20000].map((v) => (
                  <button
                    key={v}
                    onClick={() => { cart.setGlobalDiscount(v, 'value'); setShowPromotions(false); }}
                    className="py-3 bg-slate-50 rounded-xl text-sm font-medium text-[#1B004B] hover:bg-[#F3E8FF] hover:text-[#7F00B2] transition-colors"
                  >
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { cart.setGlobalDiscount(0, 'value'); setShowPromotions(false); }}
                className="w-full py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                Quitar descuento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL SELECCIONAR CLIENTE ========== */}
      {showClientSelect && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1B004B]">Seleccionar cliente</h3>
              <button
                onClick={() => setShowClientSelect(false)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => { setCustomerSearch(e.target.value); fetchCustomers(e.target.value); }}
                placeholder="Buscar cliente..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
              />
            </div>

            <button
              onClick={() => { setShowClientSelect(false); setShowClientCreate(true); }}
              className="w-full py-3 mb-3 bg-[#1B004B] text-white rounded-xl text-sm font-medium hover:bg-[#4C007D] transition-colors"
            >
              + Crear cliente nuevo
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              {customers.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">No se encontraron clientes</p>
              ) : (
                customers.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      cart.setClient({
                        id: c.id,
                        firstName: c.firstName,
                        lastName: c.lastName,
                        email: c.email,
                        phone: c.phone,
                        document: c.taxId,
                        balance: Number(c.balance) || 0,
                      });
                      setShowClientSelect(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-[#F3E8FF] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {c.firstName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1B004B] truncate">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-slate-400">{c.phone || c.email || 'Sin contacto'}</p>
                    </div>
                    {Number(c.balance) > 0 && (
                      <span className="text-xs text-red-500 font-medium">${Number(c.balance).toLocaleString()}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL CREAR CLIENTE ========== */}
      {showClientCreate && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1B004B]">Crear cliente</h3>
              <button
                onClick={() => setShowClientCreate(false)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="firstName" required placeholder="Nombre" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
                <input name="lastName" required placeholder="Apellido" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
              </div>
              <input name="document" placeholder="Documento / NIT" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
              <input name="phone" placeholder="Teléfono" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
              <input name="email" type="email" placeholder="Correo electrónico" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]" />
              <button
                type="submit"
                disabled={creatingClient}
                className="w-full py-3 bg-[#7F00B2] text-white rounded-xl font-medium text-sm hover:bg-[#4C007D] disabled:opacity-50 transition-colors"
              >
                {creatingClient ? 'Guardando...' : 'Guardar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL PAGO ========== */}
      {showPayment && (
        <PaymentModal
          total={total}
          onConfirm={handleFinishSale}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* ========== TOAST ÉXITO ========== */}
      {saleSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-sm font-medium">Venta registrada exitosamente</span>
        </div>
      )}

      {/* ========== MODAL ESCANER ========== */}
      {showScanner && (
        <BarcodeScanner
          onScan={(code) => {
            setSearch(code);
            fetchProducts(code);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
