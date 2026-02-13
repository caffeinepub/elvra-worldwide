import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAddToCart } from '../hooks/useAddToCart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShoppingCart, AlertCircle } from 'lucide-react';
import { Gender } from '../backend';
import { validateEmail, validateDescription } from '../utils/validation';
import { getSessionParameter, clearSessionParameter } from '../utils/urlParams';

export default function OrderFormPage() {
  const navigate = useNavigate();
  const addToCartMutation = useAddToCart();

  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    brandName: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    // Load order details from session storage
    const product = getSessionParameter('orderProduct');
    const orderPrice = getSessionParameter('orderPrice');
    const delivery = getSessionParameter('orderDelivery');

    if (product && orderPrice && delivery) {
      setProductName(product);
      setPrice(orderPrice);
      setDeliveryTime(delivery);
    } else {
      // No order details found, redirect to services
      navigate({ to: '/services' });
    }
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.brandName.trim()) newErrors.brandName = 'Shop/Brand name is required';
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else {
      const descValidation = validateDescription(formData.description);
      if (!descValidation.isValid) {
        newErrors.description = descValidation.message || 'Description is invalid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      const orderId = await addToCartMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: '', // Not required in new flow
        dob: '', // Not required in new flow
        gender: Gender.other, // Default value
        product: productName,
        sampleSelected: 'Standard', // Default sample
        brandName: formData.brandName,
        description: formData.description,
        price,
        deliveryTime,
      });

      if (!orderId || orderId === BigInt(0)) {
        setSubmitError('Failed to create order. Please try again.');
        return;
      }

      // Clear session storage
      clearSessionParameter('orderProduct');
      clearSessionParameter('orderPrice');
      clearSessionParameter('orderDelivery');

      navigate({ to: '/payment/$orderId', params: { orderId: orderId.toString() } });
    } catch (error: any) {
      console.error('Order creation error:', error);
      setSubmitError(error.message || 'Failed to create order. Please try again.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!productName) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Complete Your Order</h1>
          <p className="text-lg text-muted-foreground">
            Fill in your details to proceed with your order
          </p>
        </div>

        <Card className="shadow-luxury">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Product: {productName} • {price} • {deliveryTime}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Order Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandName">Shop / Brand Name *</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => handleChange('brandName', e.target.value)}
                  placeholder="Enter your shop or brand name"
                  className={errors.brandName ? 'border-destructive' : ''}
                />
                {errors.brandName && <p className="text-sm text-destructive">{errors.brandName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your requirements in detail (max 1000 words)"
                  rows={6}
                  className={errors.description ? 'border-destructive' : ''}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.description.trim().split(/\s+/).filter(w => w.length > 0).length} / 1000 words
                </p>
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <Button
                type="submit"
                disabled={addToCartMutation.isPending}
                className="w-full shadow-luxury"
                size="lg"
              >
                {addToCartMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
