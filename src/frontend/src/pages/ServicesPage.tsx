import { useNavigate } from '@tanstack/react-router';
import { useAuthState } from '../hooks/useAuthState';
import ServiceCard from '../components/ServiceCard';
import { PREMIUM_SERVICES } from '../constants/premiumServices';
import { storeSessionParameter } from '../utils/urlParams';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();

  const handleOrderNow = (productName: string, price: number, delivery: string) => {
    if (isAuthenticated) {
      // Store order details for the order form
      storeSessionParameter('orderProduct', productName);
      storeSessionParameter('orderPrice', `$${price}`);
      storeSessionParameter('orderDelivery', delivery);
      
      navigate({ to: '/order' });
    } else {
      navigate({ to: '/login' });
    }
  };

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Services</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional design solutions tailored to elevate your brand presence globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {PREMIUM_SERVICES.map((service) => (
            <ServiceCard
              key={service.name}
              icon={service.icon}
              name={service.name}
              priceLabel={service.priceLabel}
              deliveryTime={service.deliveryTime}
              action={
                <button
                  onClick={() => handleOrderNow(service.name, service.priceUSD, service.deliveryTime)}
                  className="order-btn w-full"
                >
                  Order Now
                </button>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
