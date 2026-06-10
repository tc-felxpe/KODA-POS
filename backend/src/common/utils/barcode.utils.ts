/**
 * Genera códigos de barras EAN-13 únicos.
 * Formato: prefijo 770200 + secuencial de 5 dígitos + dígito verificador = 13 dígitos
 */

const PREFIX = '770200';

/**
 * Calcula el dígito verificador EAN-13 para una cadena de 12 dígitos
 */
export function calculateEAN13CheckDigit(base12: string): number {
  if (base12.length !== 12 || !/^\d{12}$/.test(base12)) {
    throw new Error('La base debe ser exactamente 12 dígitos numéricos');
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base12[i], 10);
    // Posiciones impares (1,3,5...) se multiplican por 1
    // Posiciones pares (2,4,6...) se multiplican por 3
    sum += (i % 2 === 0) ? digit * 1 : digit * 3;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Genera un EAN-13 completo a partir de una base de 12 dígitos
 */
export function generateEAN13(base12: string): string {
  const checkDigit = calculateEAN13CheckDigit(base12);
  return base12 + checkDigit.toString();
}

/**
 * Genera la siguiente secuencia numérica basada en el último barcode del tenant.
 * Si no hay previos, empieza en 00001.
 */
export function generateNextBarcodeSequence(lastBarcode?: string | null): string {
  let nextNum = 1;

  if (lastBarcode && lastBarcode.startsWith(PREFIX) && lastBarcode.length === 13) {
    const seqPart = lastBarcode.substring(PREFIX.length, PREFIX.length + 5);
    const parsed = parseInt(seqPart, 10);
    if (!isNaN(parsed)) {
      nextNum = parsed + 1;
    }
  }

  const seqStr = nextNum.toString().padStart(6, '0');
  return PREFIX + seqStr;
}

/**
 * Valida que un código sea un EAN-13 válido (solo dígitos, longitud 13)
 */
export function isValidEAN13(barcode: string): boolean {
  if (!barcode || barcode.length !== 13) return false;
  if (!/^\d{13}$/.test(barcode)) return false;

  const base12 = barcode.substring(0, 12);
  const checkDigit = parseInt(barcode[12], 10);
  return calculateEAN13CheckDigit(base12) === checkDigit;
}
