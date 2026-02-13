import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useAuthState } from '../hooks/useAuthState';
import { getPremiumServiceByName } from '../constants/premiumServices';
import { storeSessionParameter } from '../utils/urlParams';
import ExploreWorkSamplesGallery from '../components/ExploreWorkSamplesGallery';
import { ShowcaseCategory } from '../backend';

export default function ProductBannerPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();
  const service = getPremiumServiceByName('Product Banner Design');
  
  const handleOrderNow = () => {
    if (isAuthenticated && service) {
      storeSessionParameter('orderProduct', service.name);
      storeSessionParameter('orderPrice', service.priceLabel);
      storeSessionParameter('orderDelivery', service.deliveryTime);
      navigate({ to: '/order' });
    } else {
      navigate({ to: '/login' });
    }
  };

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Product Banner Design</h1>
            <p className="text-lg text-muted-foreground">
              Eye-catching product banners that drive engagement and sales.
            </p>
          </div>

          <div className="rounded-lg overflow-hidden border border-border shadow-luxury mb-12">
            <img 
              src="/assets/generated/banner3.dim_1600x900.jpg" 
              alt="Product Banner"
              className="w-full h-auto"
            />
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-luxury mb-12">
            <h2 className="text-2xl font-serif font-bold mb-4">About This Product</h2>
            <p className="text-muted-foreground mb-6">
              Our product banner designs are crafted to capture attention and convert viewers into customers. 
              We create visually stunning banners optimized for various platforms, ensuring your products 
              stand out in the digital marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleOrderNow}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-luxury"
              >
                Order Now - {service?.priceLabel}
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <ExploreWorkSamplesGallery category={ShowcaseCategory.productBanner} />
        </div>
      </div>
    </div>
  );
}
