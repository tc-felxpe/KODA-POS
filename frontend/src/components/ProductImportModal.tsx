'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import api from '@/lib/axios';

interface ProductImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EXPECTED_HEADERS = ['name', 'sku', 'barcode', 'salePrice', 'costPrice', 'minStock', 'unit', 'tax', 'initialStock', 'description'];

const SAMPLE_CSV = `name,sku,barcode,salePrice,costPrice,minStock,unit,tax,initialStock,description
Coca Cola 400ml,CC-001,7702000000013,3500,2000,10,UNIDAD,19,50,Gaseosa personal
Papas Fritas,PF-001,,4500,2500,5,UNIDAD,19,30,Papas naturales
`;

export default function ProductImportModal({ onClose, onSuccess }: ProductImportModalProps) {
  const [parsed, setParsed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Solo archivos .csv son soportados');
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data as any[];
        const valid = rows.filter((r) => r.name && r.name.trim());
        setParsed(valid);
        setResult(null);
      },
      error: () => alert('Error al leer el archivo CSV'),
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setLoading(true);
    try {
      const res = await api.post('/products/import', { products: parsed });
      setResult(res.data);
      if (res.data.created > 0) onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al importar');
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos_plantilla.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1B004B]">Importar productos</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">✕</button>
        </div>

        {!result && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={downloadSample}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                📥 Descargar plantilla
              </button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragOver ? 'border-[#7F00B2] bg-[#F3E8FF]' : 'border-slate-300 bg-slate-50'
              }`}
            >
              <p className="text-sm text-slate-600 mb-2">
                Arrastra un archivo CSV aquí o{' '}
                <label className="text-[#7F00B2] font-medium cursor-pointer hover:underline">
                  selecciona uno
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </label>
              </p>
              <p className="text-xs text-slate-400">
                Columnas esperadas: {EXPECTED_HEADERS.join(', ')}
              </p>
            </div>
          </>
        )}

        {parsed.length > 0 && !result && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">
              {parsed.length} producto(s) listo(s) para importar
            </p>
            <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-right">Precio</th>
                    <th className="px-3 py-2 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsed.slice(0, 10).map((p, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2 text-slate-500">{p.sku || '-'}</td>
                      <td className="px-3 py-2 text-right">${p.salePrice || 0}</td>
                      <td className="px-3 py-2 text-right">{p.initialStock || 0}</td>
                    </tr>
                  ))}
                  {parsed.length > 10 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-center text-slate-400">
                        ... y {parsed.length - 10} más
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-4">
              <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{result.created}</p>
                <p className="text-xs text-green-600">Productos creados</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{result.errors.length}</p>
                <p className="text-xs text-red-600">Errores</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto bg-red-50 rounded-xl p-3 text-xs text-red-700 space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {!result ? (
            <>
              <button
                onClick={handleImport}
                disabled={parsed.length === 0 || loading}
                className="flex-1 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] disabled:bg-slate-300 text-white rounded-xl text-sm font-medium"
              >
                {loading ? 'Importando...' : `Importar ${parsed.length} productos`}
              </button>
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={onClose} className="flex-1 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white rounded-xl text-sm font-medium">
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
