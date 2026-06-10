export interface Promotion {
  id: string;
  name: string;
  type: 'combo' | 'bulk_price' | 'bulk_discount';
  productIds?: string[]; // si es vacío, aplica a todos
  minQty: number;
  payQty?: number; // para combos (2x1 -> minQty=2, payQty=1)
  specialPrice?: number; // precio especial por grupo
  discountPercent?: number; // descuento por porcentaje si compra minQty+
}

export interface AppliedPromotion {
  promotionId: string;
  name: string;
  discount: number;
}

export const DEFAULT_PROMOTIONS: Promotion[] = [
  { id: 'combo-2x1', name: '2x1', type: 'combo', minQty: 2, payQty: 1 },
  { id: 'combo-3x2', name: '3x2', type: 'combo', minQty: 3, payQty: 2 },
  { id: 'combo-4x3', name: '4x3', type: 'combo', minQty: 4, payQty: 3 },
  { id: 'bulk-3-50k', name: 'Lleve 3 por $50.000', type: 'bulk_price', minQty: 3, specialPrice: 50000 },
  { id: 'bulk-5-10p', name: '-10% en 5+ unidades', type: 'bulk_discount', minQty: 5, discountPercent: 10 },
  { id: 'bulk-10-20p', name: '-20% en 10+ unidades', type: 'bulk_discount', minQty: 10, discountPercent: 20 },
];

export function calculatePromotions(
  items: { productId: string; name: string; quantity: number; salePrice: number }[],
  activePromotionIds: string[]
): AppliedPromotion[] {
  const activePromotions = DEFAULT_PROMOTIONS.filter((p) => activePromotionIds.includes(p.id));
  const applied: AppliedPromotion[] = [];

  for (const promo of activePromotions) {
    let totalDiscount = 0;

    for (const item of items) {
      if (promo.productIds && promo.productIds.length > 0 && !promo.productIds.includes(item.productId)) {
        continue;
      }

      if (item.quantity < promo.minQty) continue;

      if (promo.type === 'combo' && promo.payQty !== undefined) {
        const groups = Math.floor(item.quantity / promo.minQty);
        const freeItems = groups * (promo.minQty - promo.payQty);
        totalDiscount += freeItems * item.salePrice;
      }

      if (promo.type === 'bulk_price' && promo.specialPrice !== undefined) {
        const groups = Math.floor(item.quantity / promo.minQty);
        const originalTotal = groups * promo.minQty * item.salePrice;
        const newTotal = groups * promo.specialPrice;
        totalDiscount += originalTotal - newTotal;
      }

      if (promo.type === 'bulk_discount' && promo.discountPercent !== undefined) {
        const discount = (item.quantity * item.salePrice * promo.discountPercent) / 100;
        totalDiscount += discount;
      }
    }

    if (totalDiscount > 0) {
      applied.push({ promotionId: promo.id, name: promo.name, discount: totalDiscount });
    }
  }

  return applied;
}
