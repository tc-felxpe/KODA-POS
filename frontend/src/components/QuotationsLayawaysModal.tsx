'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface Sale {
  id: string;
  saleNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;
  details: {
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      name: string;
    } | null;
  }[];
  payments: {
    amount: number;
    paymentMethod: {
      name: string;
    } | null;
  }[];
}

interface Props {
  type: 'quotation' | 'layaway';
  onClose: () => void;
  onConvert?: (sale: Sale) => void;
  onSelect?: (sale: Sale) => void;
}

export default function QuotationsLayawaysModal({ type, onClose, onConvert, onSelect }: Props) {
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState<string | null>(null);

  const title = type === 'quotation' ? 'Cotizaciones' : 'Apartados';
  const emptyText = type === 'quotation' ? 'No hay cotizaciones' : 'No hay apartados';
  const convertLabel = type === 'quotation' ? 'Convertir a venta' : 'Completar apartado';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = type === 'quotation' ? '/sales/quotations' : '/sales/layaways';
      const res = await api.get(endpoint);
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleConvert = async (sale: Sale) => {
    setConverting(sale.id);
    try {
      await api.post(`/sales/${sale.id}/convert`);
      if (onConvert) onConvert(sale);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al convertir');
    } finally {
      setConverting(null);
    }
  };

  const getPaidAmount = (sale: Sale) => {
    return sale.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1B004B]">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F00B2]" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">{emptyText}</p>
          ) : (
            items.map((sale) => {
              const paid = getPaidAmount(sale);
              const remaining = Number(sale.total) - paid;
              return (
                <div key={sale.id} className="p-4 bg-slate-50 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1B004B]">
                        #{sale.saleNumber}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(sale.createdAt).toLocaleString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#1B004B]">
                        ${Number(sale.total).toLocaleString()}
                      </p>
                      {type === 'layaway' && (
                        <p className="text-xs text-orange-600">
                          Abonado: ${paid.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {sale.customer && (
                    <p className="text-xs text-slate-500">
                      Cliente: {sale.customer.firstName} {sale.customer.lastName}
                      {sale.customer.phone && ` • ${sale.customer.phone}`}
                    </p>
                  )}

                  <div className="text-xs text-slate-500 space-y-0.5">
                    {sale.details.slice(0, 3).map((d, i) => (
                      <p key={i}>
                        {d.quantity}x {d.product?.name || 'Producto'} — ${Number(d.subtotal).toLocaleString()}
                      </p>
                    ))}
                    {sale.details.length > 3 && (
                      <p className="text-slate-400">+{sale.details.length - 3} más...</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    {onSelect && (
                      <button
                        onClick={() => { onSelect(sale); onClose(); }}
                        className="flex-1 py-2 bg-[#F3E8FF] text-[#7F00B2] rounded-xl text-xs font-medium hover:bg-[#E9D5FF] transition-colors"
                      >
                        Cargar al carrito
                      </button>
                    )}
                    <button
                      onClick={() => handleConvert(sale)}
                      disabled={converting === sale.id}
                      className="flex-1 py-2 bg-[#1B004B] text-white rounded-xl text-xs font-medium hover:bg-[#4C007D] disabled:opacity-50 transition-colors"
                    >
                      {converting === sale.id ? 'Procesando...' : convertLabel}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
