import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductAddToCartSection from '../components/ProductAddToCartSection';
import { getPremiumServiceByName } from '../constants/premiumServices';

export default function ProductBannerPage() {
  const [currentPreview, setCurrentPreview] = useState<'original' | 'duplicate'>('original');
  const service = getPremiumServiceByName('Product Banner Design');

  const previews = {
    original: {
      src: '/assets/generated/product-banner-original.dim_1600x900.png',
      label: 'Original Design',
    },
    duplicate: {
      src: '/assets/generated/product-banner-duplicate-with-photo.dim_1600x900.png',
      label: 'Design with Photo',
    },
  };

  const togglePreview = () => {
    setCurrentPreview(prev => prev === 'original' ? 'duplicate' : 'original');
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
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Product Banner</h1>
            <p className="text-lg text-muted-foreground">
              Eye-catching product banners that drive engagement and sales.
            </p>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold">Preview Designs</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  {currentPreview === 'original' ? '1' : '2'} / 2
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border border-border shadow-luxury bg-card">
              <div className="p-4 bg-muted/50 border-b border-border">
                <p className="text-sm font-medium text-center">
                  {previews[currentPreview].label}
                </p>
              </div>
              <div className="relative aspect-video">
                <img 
                  src={previews[currentPreview].src}
                  alt={previews[currentPreview].label}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={() => setCurrentPreview('original')}
                className={`h-2 w-8 rounded-full transition-colors ${
                  currentPreview === 'original' ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label="View original design"
              />
              <button
                onClick={() => setCurrentPreview('duplicate')}
                className={`h-2 w-8 rounded-full transition-colors ${
                  currentPreview === 'duplicate' ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label="View design with photo"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-luxury mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">About This Product</h2>
            <p className="text-muted-foreground mb-6">
              Elevate your marketing campaigns with stunning product banners designed to capture attention 
              and convert viewers into customers. Our designs blend creativity with strategic messaging 
              to showcase your products in the best light across all digital platforms.
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
            productName="Product Banner Design"
            price={service?.priceLabel || '$150'}
            deliveryTime={service?.deliveryTime || 'Delivery: 3 Business Days'}
          />
        </div>
      </div>
    </div>
  );
}
