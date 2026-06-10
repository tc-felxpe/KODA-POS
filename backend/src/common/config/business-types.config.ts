export type BusinessType =
  | 'GENERAL'
  | 'CLOTHING'
  | 'SPORTS'
  | 'STATIONERY'
  | 'MINIMARKET'
  | 'TECHNOLOGY'
  | 'PETS'
  | 'BEAUTY';

export interface DynamicField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export const BUSINESS_TYPE_CONFIG: Record<BusinessType, { label: string; fields: DynamicField[] }> = {
  GENERAL: {
    label: 'General',
    fields: [],
  },
  CLOTHING: {
    label: 'Tienda de ropa',
    fields: [
      { key: 'size', label: 'Talla', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'] },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'gender', label: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña'] },
      { key: 'material', label: 'Material', type: 'text' },
    ],
  },
  SPORTS: {
    label: 'Tienda deportiva',
    fields: [
      { key: 'size', label: 'Talla', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'] },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'sport', label: 'Deporte', type: 'select', options: ['Fútbol', 'Baloncesto', 'Tenis', 'Running', 'Natación', 'Ciclismo', 'Gym', 'Otro'] },
    ],
  },
  STATIONERY: {
    label: 'Papelería',
    fields: [
      { key: 'reference', label: 'Referencia', type: 'text' },
      { key: 'unit', label: 'Unidad de venta', type: 'select', options: ['Unidad', 'Docena', 'Caja', 'Paquete', 'Resma'] },
    ],
  },
  MINIMARKET: {
    label: 'Minimercado',
    fields: [
      { key: 'weight', label: 'Peso', type: 'number' },
      { key: 'unitOfMeasure', label: 'Unidad de medida', type: 'select', options: ['kg', 'g', 'lb', 'oz', 'L', 'ml'] },
      { key: 'expirationDate', label: 'Fecha de vencimiento', type: 'date' },
      { key: 'lot', label: 'Lote', type: 'text' },
    ],
  },
  TECHNOLOGY: {
    label: 'Tecnología',
    fields: [
      { key: 'model', label: 'Modelo', type: 'text' },
      { key: 'serialNumber', label: 'Número de serie', type: 'text' },
      { key: 'warranty', label: 'Garantía (meses)', type: 'number' },
    ],
  },
  PETS: {
    label: 'Mascotas',
    fields: [
      { key: 'petType', label: 'Tipo de mascota', type: 'select', options: ['Perro', 'Gato', 'Ave', 'Pez', 'Roedor', 'Reptil', 'Otro'] },
      { key: 'weight', label: 'Peso (kg)', type: 'number' },
      { key: 'recommendedAge', label: 'Edad recomendada', type: 'text' },
    ],
  },
  BEAUTY: {
    label: 'Belleza',
    fields: [
      { key: 'productType', label: 'Tipo de producto', type: 'select', options: ['Cuidado facial', 'Cuidado capilar', 'Maquillaje', 'Perfume', 'Uñas', 'Corporal', 'Otro'] },
      { key: 'expirationDate', label: 'Fecha de vencimiento', type: 'date' },
      { key: 'lot', label: 'Lote', type: 'text' },
    ],
  },
};

export const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'CLOTHING', label: 'Tienda de ropa' },
  { value: 'SPORTS', label: 'Tienda deportiva' },
  { value: 'STATIONERY', label: 'Papelería' },
  { value: 'MINIMARKET', label: 'Minimercado' },
  { value: 'TECHNOLOGY', label: 'Tecnología' },
  { value: 'PETS', label: 'Mascotas' },
  { value: 'BEAUTY', label: 'Belleza' },
];
