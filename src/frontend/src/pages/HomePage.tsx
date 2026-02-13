import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuthState } from '../hooks/useAuthState';
import ServiceCard from '../components/ServiceCard';
import { ArrowRight } from 'lucide-react';
import { PREMIUM_SERVICES } from '../constants/premiumServices';
import { useEffect } from 'react';

export default function HomePage() {
  const { isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const search = useSearch({ from: '/' });

  // Handle scroll on mount if scrollTo param is present
  useEffect(() => {
    if (search && 'scrollTo' in search && search.scrollTo === 'premium-services') {
      setTimeout(() => {
        const section = document.getElementById('premium-services');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [search]);

  const openOrder = (productName: string, price: number, delivery: string) => {
    if (isAuthenticated) {
      sessionStorage.setItem('orderSelection', JSON.stringify({
        productName,
        price,
        delivery
      }));
      
      navigate({ 
        to: '/dashboard',
        search: { sample: productName }
      });
    } else {
      navigate({ to: '/login' });
    }
  };

  const products = [
    { name: 'Business Card', page: '/products/business-card', banner: '/assets/generated/banner1.dim_1600x900.jpg' },
    { name: 'Logo Design', page: '/products/logo-design', banner: '/assets/generated/banner2.dim_1600x900.jpg' },
    { name: 'Product Banner', page: '/products/product-banner', banner: '/assets/generated/banner3.dim_1600x900.jpg' },
    { name: 'Photo Frame', page: '/products/photo-frame', banner: '/assets/generated/banner4.dim_1600x900.jpg' },
  ];

  const scrollToServices = () => {
    const section = document.getElementById('premium-services');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-balance text-white">
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
              <button
                onClick={scrollToServices}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - SINGLE INSTANCE */}
      <section id="premium-services" className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Premium Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
                    onClick={() => openOrder(service.name, service.priceUSD, service.deliveryTime)}
                    className="order-btn w-full"
                  >
                    Order Now
                  </button>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section id="products" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Explore Our Work</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our range of premium design products crafted with excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {products.map((product) => (
              <div
                key={product.name}
                onClick={() => navigate({ to: product.page })}
                className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card hover:shadow-luxury transition-all duration-300 hover:scale-105"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={product.banner} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-center group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </div>
              </div>
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
