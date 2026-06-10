'use client';

import { useState } from 'react';
import api from '@/lib/axios';

interface CancelModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelModal({ onClose, onSuccess }: CancelModalProps) {
  const [saleNumber, setSaleNumber] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    if (!saleNumber.trim()) return;
    setLoading(true);
    setError('');
    try {
      /* Buscar venta por número */
      const res = await api.get('/sales', { params: { search: saleNumber } });
      const sale = res.data[0];
      if (!sale) {
        setError('Venta no encontrada');
        setLoading(false);
        return;
      }
      /* Anular */
      await api.post(`/sales/${sale.id}/cancel`, { reason: reason || undefined });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al anular la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#1B004B]">Anular venta</h3>
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

        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Esta acción requiere permisos de administrador. Se registrará el usuario, fecha y hora.
          </p>

          <input
            type="text"
            value={saleNumber}
            onChange={(e) => setSaleNumber(e.target.value)}
            placeholder="Número de venta (ej: VEN-000001)"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
          />

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo de anulación (obligatorio)"
            rows={3}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8] resize-none"
          />

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCancel}
            disabled={loading || !saleNumber.trim() || !reason.trim()}
            className="w-full py-3 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Anulando...' : 'Confirmar anulación'}
          </button>
        </div>
      </div>
    </div>
  );
}
