import { useNavigate } from '@tanstack/react-router';
import { useAuthState } from '../hooks/useAuthState';
import { useServices } from '../hooks/useServices';
import ServiceCard from '../components/ServiceCard';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();
  const { data: services, isLoading } = useServices();

  const handleOrderNow = (serviceName: string) => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    } else {
      navigate({ to: '/dashboard', search: { sample: serviceName } });
    }
  };

  const serviceIcons: Record<string, string> = {
    'Business Card Design': '/assets/generated/business-card-icon.dim_256x256.png',
    'Logo Design': '/assets/generated/logo-design-icon.dim_256x256.png',
    'Photo Frame Design': '/assets/generated/photo-frame-icon.dim_256x256.png',
  };

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Services</h1>
          <p className="text-lg text-muted-foreground">
            Premium design services delivered with excellence and precision.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services?.map((service) => (
              <ServiceCard
                key={service.id.toString()}
                icon={serviceIcons[service.name]}
                name={service.name}
                priceRange={service.priceRange}
                deliveryTime={service.deliveryTime}
                action={
                  <button
                    onClick={() => handleOrderNow(service.name)}
                    className="w-full px-4 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Order Now
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
