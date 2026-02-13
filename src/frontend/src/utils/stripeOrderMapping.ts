import { ShoppingItem } from '../backend';
import type { ExpandedOrder } from '../backend';

export function orderToShoppingItems(order: ExpandedOrder): ShoppingItem[] {
  // Extract price from order.price string (e.g., "$20" -> 20)
  const priceMatch = order.price.match(/\$?(\d+)/);
  if (!priceMatch) {
    throw new Error('Unable to determine order price');
  }
  
  const priceInDollars = parseInt(priceMatch[1], 10);
  if (isNaN(priceInDollars) || priceInDollars <= 0) {
    throw new Error('Invalid order price');
  }

  const priceInCents = priceInDollars * 100;

  return [
    {
      currency: 'usd',
      productName: order.product,
      productDescription: `${order.product} - ${order.sampleSelected} for ${order.brandName}`,
      priceInCents: BigInt(priceInCents),
      quantity: BigInt(1),
    },
  ];
}
