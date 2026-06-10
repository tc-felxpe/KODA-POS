'use client';

import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  salePrice: number;
  unit?: string;
}

interface ProductVariant {
  id?: string;
  name: string;
  sku?: string;
  barcode?: string;
  salePrice?: number;
}

interface LabelPrintModalProps {
  product: Product;
  variant?: ProductVariant;
  onClose: () => void;
}

type LabelSize = '30x20' | '40x30' | '50x30' | '58x40';

const SIZE_CONFIG: Record<LabelSize, { width: number; height: number; className: string }> = {
  '30x20': { width: 30, height: 20, className: 'w-[30mm] h-[20mm]' },
  '40x30': { width: 40, height: 30, className: 'w-[40mm] h-[30mm]' },
  '50x30': { width: 50, height: 30, className: 'w-[50mm] h-[30mm]' },
  '58x40': { width: 58, height: 40, className: 'w-[58mm] h-[40mm]' },
};

export default function LabelPrintModal({ product, variant, onClose }: LabelPrintModalProps) {
  const [size, setSize] = useState<LabelSize>('40x30');
  const [showName, setShowName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showSku, setShowSku] = useState(false);
  const [showBarcode, setShowBarcode] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const barcodeRef = useRef<SVGSVGElement>(null);

  const displayName = variant ? `${product.name} - ${variant.name}` : product.name;
  const displaySku = variant?.sku || product.sku || '';
  const displayBarcode = variant?.barcode || product.barcode || '';
  const displayPrice = variant?.salePrice || product.salePrice;

  useEffect(() => {
    if (barcodeRef.current && showBarcode && displayBarcode) {
      try {
        JsBarcode(barcodeRef.current, displayBarcode, {
          format: 'EAN13',
          width: 1.2,
          height: 20,
          fontSize: 8,
          margin: 0,
          displayValue: true,
        });
      } catch {
        // Si no es EAN-13 válido, usar CODE128
        JsBarcode(barcodeRef.current, displayBarcode, {
          format: 'CODE128',
          width: 1.2,
          height: 20,
          fontSize: 8,
          margin: 0,
          displayValue: true,
        });
      }
    }
  }, [displayBarcode, showBarcode, size]);

  const config = SIZE_CONFIG[size];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1B004B]">Imprimir etiqueta</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">✕</button>
        </div>

        {/* Configuración */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tamaño de etiqueta</label>
            <div className="flex gap-2">
              {(['30x20', '40x30', '50x30', '58x40'] as LabelSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    size === s
                      ? 'bg-[#7F00B2] text-white border-[#7F00B2]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#BC4ED8]'
                  }`}
                >
                  {s} mm
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Campos a mostrar</label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'name', label: 'Nombre', checked: showName, set: setShowName },
                { key: 'price', label: 'Precio', checked: showPrice, set: setShowPrice },
                { key: 'sku', label: 'SKU', checked: showSku, set: setShowSku },
                { key: 'barcode', label: 'Código barras', checked: showBarcode, set: setShowBarcode },
              ].map((field) => (
                <label key={field.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.checked}
                    onChange={(e) => field.set(e.target.checked)}
                    className="w-4 h-4 text-[#7F00B2] rounded"
                  />
                  <span className="text-sm text-slate-700">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad de etiquetas</label>
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#BC4ED8]"
            />
          </div>
        </div>

        {/* Vista previa */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2">Vista previa</p>
          <div className="bg-slate-100 rounded-2xl p-6 flex items-center justify-center overflow-auto">
            <div
              className={`${config.className} bg-white border border-slate-300 flex flex-col items-center justify-center p-1.5 text-center overflow-hidden`}
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              {showName && (
                <p className="text-[8px] font-bold text-[#1B004B] leading-tight truncate w-full px-0.5">
                  {displayName}
                </p>
              )}
              {showPrice && (
                <p className="text-[10px] font-bold text-[#7F00B2] leading-tight">
                  ${Number(displayPrice).toLocaleString()}
                </p>
              )}
              {showSku && displaySku && (
                <p className="text-[6px] text-slate-500 leading-tight">{displaySku}</p>
              )}
              {showBarcode && displayBarcode && (
                <svg ref={barcodeRef} className="max-w-full" />
              )}
              {!displayBarcode && showBarcode && (
                <p className="text-[6px] text-red-500">Sin código de barras</p>
              )}
            </div>
          </div>
        </div>

        {/* Hoja de impresión (oculta en pantalla, visible al imprimir) */}
        <div className="hidden print:block">
          <div className="flex flex-wrap gap-0">
            {Array.from({ length: quantity }).map((_, i) => (
              <div
                key={i}
                className={`${config.className} bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center p-1.5 text-center overflow-hidden page-break-inside-avoid`}
              >
                {showName && (
                  <p className="text-[8px] font-bold text-black leading-tight truncate w-full px-0.5">
                    {displayName}
                  </p>
                )}
                {showPrice && (
                  <p className="text-[10px] font-bold text-black leading-tight">
                    ${Number(displayPrice).toLocaleString()}
                  </p>
                )}
                {showSku && displaySku && (
                  <p className="text-[6px] text-slate-700 leading-tight">{displaySku}</p>
                )}
                {showBarcode && displayBarcode && (
                  <svg
                    className="max-w-full"
                    dangerouslySetInnerHTML={{
                      __html: barcodeRef.current?.outerHTML || '',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white rounded-xl text-sm font-medium"
          >
            🖨️ Imprimir {quantity > 1 ? `(${quantity})` : ''}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\:block,
          .print\:block * {
            visibility: visible;
          }
          .print\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
