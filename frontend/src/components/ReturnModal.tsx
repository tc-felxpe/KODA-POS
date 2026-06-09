'use client';

import { useState } from 'react';
import api from '@/lib/axios';

interface SaleDetail {
  id: string;
  productId: string;
  product: { name: string; imageUrl: string | null };
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface Sale {
  id: string;
  saleNumber: string;
  total: number;
  details: SaleDetail[];
  customer: { firstName: string; lastName: string } | null;
}

interface ReturnModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnModal({ onClose, onSuccess }: ReturnModalProps) {
  const [saleNumber, setSaleNumber] = useState('');
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const searchSale = async () => {
    if (!saleNumber.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/sales', { params: { search: saleNumber } });
      const found = res.data[0];
      if (found) {
        setSale(found);
        setReturnItems({});
      } else {
        alert('Venta no encontrada');
        setSale(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateReturnQty = (detailId: string, maxQty: number, val: number) => {
    if (val < 0) val = 0;
    if (val > maxQty) val = maxQty;
    setReturnItems((prev) => ({ ...prev, [detailId]: val }));
  };

  const getTotalReturn = () => {
    if (!sale) return 0;
    return sale.details.reduce((sum, d) => {
      const qty = returnItems[d.id] || 0;
      return sum + qty * Number(d.unitPrice);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!sale) return;
    const items = sale.details
      .filter((d) => (returnItems[d.id] || 0) > 0)
      .map((d) => ({
        productId: d.productId,
        quantity: returnItems[d.id],
        unitPrice: Number(d.unitPrice),
      }));

    if (items.length === 0) {
      alert('Selecciona al menos un producto para devolver');
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/sales/${sale.id}/returns`, { items, reason });
      onSuccess();
      onClose();
    } catch {
      alert('Error al procesar la devolución');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#1B004B]">Devolución</h3>
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

        {/* Buscar venta */}
        {!sale && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Ingresa el número de venta para devolver productos</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={saleNumber}
                onChange={(e) => setSaleNumber(e.target.value)}
                placeholder="Ej: VEN-000001"
                className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                onKeyDown={(e) => e.key === 'Enter' && searchSale()}
              />
              <button
                onClick={searchSale}
                disabled={loading}
                className="px-4 py-2.5 bg-[#1B004B] text-white rounded-xl text-sm font-medium hover:bg-[#4C007D] disabled:opacity-40 transition-colors"
              >
                {loading ? '...' : 'Buscar'}
              </button>
            </div>
          </div>
        )}

        {/* Items de la venta */}
        {sale && (
          <div className="space-y-4">
            <div className="bg-[#F3E8FF] rounded-xl p-3">
              <p className="text-sm font-semibold text-[#1B004B]">{sale.saleNumber}</p>
              <p className="text-xs text-slate-500">
                {sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Cliente general'}
              </p>
              <p className="text-xs text-slate-500">Total venta: ${Number(sale.total).toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Productos</p>
              {sale.details.map((detail) => (
                <div key={detail.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg shrink-0">
                    {detail.product.imageUrl ? (
                      <img src={detail.product.imageUrl} alt={detail.product.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B004B] truncate">{detail.product.name}</p>
                    <p className="text-xs text-slate-400">
                      Vendido: {Number(detail.quantity)} × ${Number(detail.unitPrice).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateReturnQty(detail.id, Number(detail.quantity), (returnItems[detail.id] || 0) - 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{returnItems[detail.id] || 0}</span>
                    <button
                      onClick={() => updateReturnQty(detail.id, Number(detail.quantity), (returnItems[detail.id] || 0) + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo de la devolución (opcional)"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
            />

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-sm font-medium text-[#1B004B]">Total a devolver</span>
              <span className="text-xl font-bold text-[#7F00B2]">${getTotalReturn().toLocaleString()}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setSale(null); setReturnItems({}); }}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Buscar otra
              </button>
              <button
                onClick={handleSubmit}
                disabled={processing || getTotalReturn() <= 0}
                className="flex-1 py-3 bg-[#7F00B2] text-white rounded-xl text-sm font-medium hover:bg-[#4C007D] disabled:opacity-40 transition-colors"
              >
                {processing ? 'Procesando...' : 'Confirmar devolución'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
