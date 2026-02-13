import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import ProductAddToCartSection from '../components/ProductAddToCartSection';
import { getPremiumServiceByName } from '../constants/premiumServices';

export default function BusinessCardPage() {
  const service = getPremiumServiceByName('Business Card Design');
  
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
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Business Card</h1>
            <p className="text-lg text-muted-foreground">
              Premium business card designs that make a lasting impression.
            </p>
          </div>

          <div className="rounded-lg overflow-hidden border border-border shadow-luxury mb-12">
            <img 
              src="/assets/generated/banner1.dim_1600x900.jpg" 
              alt="Business Card"
              className="w-full h-auto"
            />
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-luxury mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">About This Product</h2>
            <p className="text-muted-foreground mb-6">
              Our business card designs combine elegance with professionalism, ensuring your brand stands out. 
              Each design is crafted with attention to detail, using premium materials and sophisticated layouts 
              that reflect your brand's identity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <ProductAddToCartSection 
            productName="Business Card Design"
            price={service?.priceLabel || '$20'}
            deliveryTime={service?.deliveryTime || 'Delivery: 3 Business Days'}
          />
        </div>
      </div>
    </div>
  );
}
