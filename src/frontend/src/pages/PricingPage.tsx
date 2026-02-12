import { useServices } from '../hooks/useServices';
import ServiceCard from '../components/ServiceCard';
import { CreditCard } from 'lucide-react';
import { SiStripe } from 'react-icons/si';

export default function PricingPage() {
  const { data: services, isLoading } = useServices();

  const serviceIcons: Record<string, string> = {
    'Business Card Design': '/assets/generated/business-card-icon.dim_256x256.png',
    'Logo Design': '/assets/generated/logo-design-icon.dim_256x256.png',
    'Photo Frame Design': '/assets/generated/photo-frame-icon.dim_256x256.png'
  };

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Pricing</h1>
          <p className="text-lg text-muted-foreground">
            Transparent pricing for premium design services.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              {services?.map((service) => (
                <ServiceCard
                  key={service.id.toString()}
                  icon={serviceIcons[service.name]}
                  name={service.name}
                  priceRange={service.priceRange}
                  deliveryTime={service.deliveryTime}
                />
              ))}
            </div>

            {/* Payment Section */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-8 shadow-luxury">
                <div className="flex items-center justify-center mb-6">
                  <CreditCard className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-2xl font-serif font-bold">Payment Options</h2>
                </div>
                <p className="text-center text-muted-foreground mb-8">
                  We accept secure payments through trusted payment providers.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                  <div className="flex items-center gap-3 px-6 py-4 bg-accent/30 rounded-lg border border-border">
                    <SiStripe className="h-8 w-8 text-primary" />
                    <span className="font-semibold">Stripe</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-accent/30 rounded-lg border border-border">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.72-4.509z" fill="oklch(0.78 0.18 85)"/>
                    </svg>
                    <span className="font-semibold">PayPal</span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  All transactions are secure and encrypted.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

