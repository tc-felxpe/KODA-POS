'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';

interface PaymentMethod {
  id: string;
  name: string;
}

interface Payment {
  paymentMethodId: string;
  amount: number;
  reference?: string;
}

interface PaymentModalProps {
  total: number;
  onConfirm: (payments: Payment[]) => void;
  onClose: () => void;
}

export default function PaymentModal({ total, onConfirm, onClose }: PaymentModalProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cashReceived, setCashReceived] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.get('/sales/payment-methods').then((res) => setMethods(res.data));
  }, []);

  const isCashMethod = (id: string) => {
    const m = methods.find((x) => x.id === id);
    return m?.name.toLowerCase().includes('efectivo');
  };

  const addPayment = () => {
    if (!selectedMethod || !amount) return;
    const val = Number(amount);
    if (val <= 0) return;

    const existing = payments.find((p) => p.paymentMethodId === selectedMethod);
    if (existing) {
      setPayments((prev) =>
        prev.map((p) =>
          p.paymentMethodId === selectedMethod
            ? { ...p, amount: p.amount + val, reference: reference || p.reference }
            : p
        )
      );
    } else {
      setPayments((prev) => [
        ...prev,
        { paymentMethodId: selectedMethod, amount: val, reference: reference || undefined },
      ]);
    }

    setSelectedMethod('');
    setAmount('');
    setReference('');
  };

  const removePayment = (methodId: string) => {
    setPayments((prev) => prev.filter((p) => p.paymentMethodId !== methodId));
  };

  const paidTotal = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const change = useMemo(() => {
    const cashPayment = payments.find((p) => {
      const m = methods.find((x) => x.id === p.paymentMethodId);
      return m?.name.toLowerCase().includes('efectivo');
    });
    if (cashPayment && paidTotal > total) {
      return paidTotal - total;
    }
    return 0;
  }, [payments, paidTotal, total, methods]);

  const remaining = Math.max(total - paidTotal, 0);

  const handleConfirm = () => {
    if (paidTotal < total) return;
    setProcessing(true);
    onConfirm(payments);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#1B004B]">Métodos de pago</h3>
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

        {/* Total a pagar */}
        <div className="bg-[#F3E8FF] rounded-2xl p-4 mb-5 text-center">
          <p className="text-xs text-[#7F00B2] font-medium uppercase tracking-wider">Total a pagar</p>
          <p className="text-3xl font-bold text-[#1B004B]">${total.toLocaleString()}</p>
        </div>

        {/* Pagos agregados */}
        {payments.length > 0 && (
          <div className="space-y-2 mb-4">
            {payments.map((p) => {
              const m = methods.find((x) => x.id === p.paymentMethodId);
              return (
                <div key={p.paymentMethodId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-[#1B004B]">{m?.name}</p>
                    {p.reference && <p className="text-xs text-slate-400">Ref: {p.reference}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1B004B]">${p.amount.toLocaleString()}</span>
                    <button
                      onClick={() => removePayment(p.paymentMethodId)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-red-400 hover:border-red-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Agregar pago */}
        {remaining > 0 && (
          <div className="space-y-3 mb-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Pendiente: ${remaining.toLocaleString()}
            </p>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
            >
              <option value="">Seleccionar método</option>
              {methods.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {selectedMethod && (
              <>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Monto${isCashMethod(selectedMethod) ? ' (efectivo recibido)' : ''}`}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                />
                {!isCashMethod(selectedMethod) && (
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Referencia / Autorización (opcional)"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
                  />
                )}
                <button
                  onClick={addPayment}
                  disabled={!amount || Number(amount) <= 0}
                  className="w-full py-2.5 bg-[#1B004B] text-white rounded-xl text-sm font-medium hover:bg-[#4C007D] disabled:opacity-40 transition-colors"
                >
                  + Agregar pago
                </button>
              </>
            )}
          </div>
        )}

        {/* Cambio */}
        {change > 0 && (
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl mb-4">
            <span className="text-sm font-medium text-green-700">Cambio</span>
            <span className="text-lg font-bold text-green-700">${change.toLocaleString()}</span>
          </div>
        )}

        {/* Botón finalizar */}
        <button
          onClick={handleConfirm}
          disabled={paidTotal < total || processing}
          className="w-full py-3.5 bg-[#7F00B2] text-white rounded-full font-medium text-sm hover:bg-[#4C007D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-purple-200/50"
        >
          {processing ? 'Procesando...' : `Finalizar venta ($${paidTotal.toLocaleString()})`}
        </button>
      </div>
    </div>
  );
}
