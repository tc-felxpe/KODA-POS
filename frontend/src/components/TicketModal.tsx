'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

interface TicketItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface TicketPayment {
  method: string;
  amount: number;
}

interface TicketModalProps {
  saleNumber: string;
  date: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessTaxId?: string;
  cashier: string;
  customer?: string;
  items: TicketItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payments: TicketPayment[];
  onClose: () => void;
}

export default function TicketModal({
  saleNumber,
  date,
  businessName,
  businessAddress,
  businessPhone,
  businessTaxId,
  cashier,
  customer,
  items,
  subtotal,
  discount,
  tax,
  total,
  payments,
  onClose,
}: TicketModalProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    const qrText = `${businessName}\nFactura: ${saleNumber}\nTotal: $${total.toLocaleString()}\nFecha: ${date}`;
    setQrData(qrText);

    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, qrText, { width: 120, margin: 1 });
    }

    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, saleNumber.replace(/\D/g, '').padStart(12, '0'), {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12,
      });
    }
  }, [saleNumber, date, total, businessName]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-[#1B004B]">Ticket de venta</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#7F00B2] text-white rounded-lg text-xs font-medium hover:bg-[#4C007D] transition-colors"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Ticket — optimizado para impresión */}
        <div className="flex-1 overflow-y-auto p-6">
          <div id="ticket-print" className="bg-white text-black" style={{ width: '100%', maxWidth: '80mm', margin: '0 auto', fontFamily: 'monospace' }}>
            {/* Logo / Nombre */}
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold uppercase tracking-wide">{businessName}</h2>
              {businessAddress && <p className="text-xs mt-1">{businessAddress}</p>}
              {businessPhone && <p className="text-xs">Tel: {businessPhone}</p>}
              {businessTaxId && <p className="text-xs">NIT: {businessTaxId}</p>}
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Info venta */}
            <div className="text-xs space-y-0.5 mb-3">
              <div className="flex justify-between">
                <span>Factura:</span>
                <span className="font-bold">{saleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{new Date(date).toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between">
                <span>Cajero:</span>
                <span>{cashier}</span>
              </div>
              {customer && (
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span>{customer}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Items */}
            <div className="text-xs mb-3">
              <div className="flex justify-between font-bold mb-1">
                <span className="flex-1">PRODUCTO</span>
                <span className="w-8 text-right">QTY</span>
                <span className="w-16 text-right">TOTAL</span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="flex justify-between py-0.5">
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="w-8 text-right">{item.quantity}</span>
                  <span className="w-16 text-right">${item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Totales */}
            <div className="text-xs space-y-0.5 mb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span>Descuento:</span>
                  <span>-${discount.toLocaleString()}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Impuestos:</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base mt-1">
                <span>TOTAL:</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Pagos */}
            <div className="border-t border-dashed border-black my-2" />
            <div className="text-xs space-y-0.5 mb-3">
              <p className="font-bold">MÉTODOS DE PAGO</p>
              {payments.map((p, i) => (
                <div key={i} className="flex justify-between">
                  <span>{p.method}:</span>
                  <span>${p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* QR y Barcode */}
            <div className="flex flex-col items-center gap-3 py-3">
              <canvas ref={qrRef} />
              <svg ref={barcodeRef} />
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Footer */}
            <div className="text-center text-xs mt-3">
              <p className="font-bold">¡Gracias por su compra!</p>
              <p className="mt-1">KODA POS — Software de Punto de Venta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ticket-print,
          #ticket-print * {
            visibility: visible;
          }
          #ticket-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            padding: 4mm;
          }
        }
      `}</style>
    </div>
  );
}
