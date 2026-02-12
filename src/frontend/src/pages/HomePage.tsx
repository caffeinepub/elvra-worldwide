import { Link } from '@tanstack/react-router';
import { useAuthState } from '../hooks/useAuthState';
import ServiceCard from '../components/ServiceCard';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuthState();

  const services = [
    {
      name: 'Business Card Design',
      priceRange: '$30–$50',
      deliveryTime: 'Delivery 3 Days',
      icon: '/assets/generated/business-card-icon.dim_256x256.png'
    },
    {
      name: 'Logo Design',
      priceRange: '$40–$80',
      deliveryTime: 'Delivery 3 Days',
      icon: '/assets/generated/logo-design-icon.dim_256x256.png'
    },
    {
      name: 'Photo Frame Design',
      priceRange: '$10–$15',
      deliveryTime: 'Delivery 3 Days',
      icon: '/assets/generated/photo-frame-icon.dim_256x256.png'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-24 md:py-32 lg:py-40 overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/generated/elvra-hero-bg.dim_2400x1350.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-balance">
              Designing Brands Worldwide
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Premium international design agency delivering world-class branding solutions with luxury and precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={isAuthenticated ? '/dashboard' : '/signup'}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-luxury hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Premium Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional design solutions tailored to elevate your brand presence globally.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service) => (
              <ServiceCard
                key={service.name}
                icon={service.icon}
                name={service.name}
                priceRange={service.priceRange}
                deliveryTime={service.deliveryTime}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-card to-accent/20 rounded-lg p-12 border border-border shadow-luxury">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Ready to Elevate Your Brand?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of satisfied clients worldwide who trust Elvra for their design needs.
            </p>
            <Link
              to={isAuthenticated ? '/dashboard' : '/signup'}
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-luxury"
            >
              Start Your Project Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

