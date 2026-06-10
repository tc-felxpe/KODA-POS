'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface BusinessType {
  value: string;
  label: string;
}

export default function SettingsPage() {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [currentType, setCurrentType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, tenantRes] = await Promise.all([
          api.get('/tenants/business-types'),
          api.get('/tenants/me'),
        ]);
        setBusinessTypes(typesRes.data.types || []);
        setCurrentType(tenantRes.data.businessType || 'GENERAL');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/tenants/me', { businessType: currentType });
      alert('Configuración guardada correctamente');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
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
      <h1 className="text-2xl font-bold text-[#1B004B]">Configuración</h1>
      <p className="text-slate-500 text-sm">Ajustes generales del sistema</p>

      <div className="mt-6 bg-white rounded-3xl shadow-sm p-6 max-w-xl">
        <h2 className="text-lg font-semibold text-[#1B004B] mb-1">Perfil de negocio</h2>
        <p className="text-slate-500 text-sm mb-4">
          Selecciona el tipo de negocio para activar los campos específicos en tus productos.
        </p>

        <div className="space-y-3">
          {businessTypes.map((bt) => (
            <label
              key={bt.value}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                currentType === bt.value
                  ? 'border-[#7F00B2] bg-[#F3E8FF]'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="businessType"
                value={bt.value}
                checked={currentType === bt.value}
                onChange={(e) => setCurrentType(e.target.value)}
                className="w-4 h-4 accent-[#7F00B2]"
              />
              <div>
                <p className="font-medium text-[#1B004B]">{bt.label}</p>
                <p className="text-xs text-slate-500">
                  {bt.value === 'GENERAL' && 'Sin campos adicionales'}
                  {bt.value === 'CLOTHING' && 'Talla, Color, Género, Material'}
                  {bt.value === 'SPORTS' && 'Talla, Color, Deporte'}
                  {bt.value === 'STATIONERY' && 'Referencia, Unidad de venta'}
                  {bt.value === 'MINIMARKET' && 'Peso, Unidad, Vencimiento, Lote'}
                  {bt.value === 'TECHNOLOGY' && 'Modelo, Serie, Garantía'}
                  {bt.value === 'PETS' && 'Tipo, Peso, Edad recomendada'}
                  {bt.value === 'BEAUTY' && 'Tipo, Vencimiento, Lote'}
                </p>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 px-6 py-2.5 bg-[#7F00B2] hover:bg-[#4C007D] text-white font-medium rounded-xl transition-colors text-sm disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  );
}
