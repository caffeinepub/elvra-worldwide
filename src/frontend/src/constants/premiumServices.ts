// Single source of truth for the four premium services with fixed prices
export interface PremiumService {
  name: string;
  priceUSD: number;
  priceLabel: string;
  deliveryTime: string;
  icon: string;
}

export const PREMIUM_SERVICES: PremiumService[] = [
  {
    name: 'Business Card Design',
    priceUSD: 20,
    priceLabel: '$20',
    deliveryTime: 'Delivery: 3 Business Days',
    icon: '/assets/generated/business-card-icon.dim_256x256.png',
  },
  {
    name: 'Brand Logo Design',
    priceUSD: 30,
    priceLabel: '$30',
    deliveryTime: 'Delivery: 3 Business Days',
    icon: '/assets/generated/logo-design-icon.dim_256x256.png',
  },
  {
    name: 'Product Banner Design',
    priceUSD: 150,
    priceLabel: '$150',
    deliveryTime: 'Delivery: 3 Business Days',
    icon: '/assets/generated/product-banner-service-photo.dim_1200x800.png',
  },
  {
    name: 'Photo Frame Design',
    priceUSD: 15,
    priceLabel: '$15',
    deliveryTime: 'Delivery: 3 Business Days',
    icon: '/assets/generated/photo-frame-icon.dim_256x256.png',
  },
];

// Helper to get service by name
export function getPremiumServiceByName(name: string): PremiumService | undefined {
  return PREMIUM_SERVICES.find(s => s.name === name);
}

// Helper to map backend service to display with fixed price
export function mapServiceToDisplay(serviceName: string): { priceLabel: string; icon: string } | null {
  const service = getPremiumServiceByName(serviceName);
  if (!service) return null;
  return {
    priceLabel: service.priceLabel,
    icon: service.icon,
  };
}
