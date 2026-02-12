import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductSampleSelector from './ProductSampleSelector';
import ProductOrderFormFields from './ProductOrderFormFields';
import { useAuthState } from '../hooks/useAuthState';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useAddToCart } from '../hooks/useAddToCart';
import { Gender, type AddToCartInput } from '../backend';
import { validateDescription } from '../utils/validation';

interface ProductAddToCartSectionProps {
  productName: string;
}

export default function ProductAddToCartSection({ productName }: ProductAddToCartSectionProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuthState();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  
  const [selectedSample, setSelectedSample] = useState('');
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');

  const addToCartMutation = useAddToCart({
    onSuccess: (orderId) => {
      // Reveal and scroll to checkout section
      const checkoutSection = document.getElementById('checkoutSection');
      if (checkoutSection) {
        checkoutSection.style.display = 'block';
        checkoutSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      navigate({ to: '/payment/$orderId', params: { orderId: orderId.toString() } });
    }
  });

  const handleAddToCart = () => {
    // Validation
    if (!selectedSample) {
      alert('Please select a sample');
      return;
    }

    if (!brandName.trim()) {
      alert('Please enter your Shop / Brand Name');
      return;
    }

    const descValidation = validateDescription(description);
    if (!descValidation.isValid) {
      alert(descValidation.message);
      return;
    }

    // Prepare payload
    const input: AddToCartInput = {
      product: productName,
      sampleSelected: selectedSample,
      brandName: brandName.trim(),
      description: description.trim(),
      price: 'Depends on requirement',
      deliveryTime: '3 Days',
      name: userProfile?.fullName || '',
      email: userProfile?.email || '',
      phone: userProfile?.mobileNumber || '',
      dob: userProfile?.dob || '',
      gender: userProfile?.gender || Gender.male,
    };

    addToCartMutation.mutate(input);
  };

  if (isInitializing || profileLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 shadow-luxury">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 shadow-luxury">
        <h2 className="text-2xl font-serif font-bold mb-4">Order This Product</h2>
        <p className="text-muted-foreground mb-6">
          Please log in or sign up to place an order for this product.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate({ to: '/login' })}
            className="px-8 py-3 text-base font-medium shadow-luxury"
          >
            Log In
          </Button>
          <Button
            onClick={() => navigate({ to: '/signup' })}
            variant="outline"
            className="px-8 py-3 text-base font-medium border-2"
          >
            Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-8 shadow-luxury space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Order This Product</h2>
        <p className="text-muted-foreground">
          Select a sample design and provide your brand details to proceed.
        </p>
      </div>

      <ProductSampleSelector
        selectedSample={selectedSample}
        onSelectSample={setSelectedSample}
      />

      <ProductOrderFormFields
        brandName={brandName}
        description={description}
        onBrandNameChange={setBrandName}
        onDescriptionChange={setDescription}
      />

      <div className="pt-4">
        <Button
          id="addToCartBtn"
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending}
          className="w-full sm:w-auto px-8 py-3 text-base font-medium shadow-luxury"
        >
          {addToCartMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Adding to Cart...
            </>
          ) : (
            'Add to Cart & Proceed'
          )}
        </Button>
      </div>
    </div>
  );
}
