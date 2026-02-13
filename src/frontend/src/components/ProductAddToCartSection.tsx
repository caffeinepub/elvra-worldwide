import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAddToCart } from '../hooks/useAddToCart';
import { useAuthState } from '../hooks/useAuthState';
import ProductSampleSelector from './ProductSampleSelector';
import ProductOrderFormFields from './ProductOrderFormFields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShoppingCart, AlertCircle, ArrowRight } from 'lucide-react';
import { Gender } from '../backend';
import { validateEmail, validateDescription } from '../utils/validation';

interface ProductAddToCartSectionProps {
  productName: string;
  price: string;
  deliveryTime: string;
}

export default function ProductAddToCartSection({
  productName,
  price,
  deliveryTime,
}: ProductAddToCartSectionProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();
  const addToCartMutation = useAddToCart();

  const [step, setStep] = useState<'sample' | 'form'>('sample');
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: Gender.other,
    brandName: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const handleSampleSelect = (sample: string) => {
    setSelectedSample(sample);
  };

  const handleContinue = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    if (selectedSample) {
      setStep('form');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dob.trim()) newErrors.dob = 'Date of birth is required';
    if (!formData.brandName.trim()) newErrors.brandName = 'Brand name is required';
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
        ...formData,
        product: productName,
        sampleSelected: selectedSample,
        price,
        deliveryTime,
      });

      if (!orderId || orderId === BigInt(0)) {
        setSubmitError('Failed to create order. Please try again.');
        return;
      }

      navigate({ to: '/payment/$orderId', params: { orderId: orderId.toString() } });
    } catch (error: any) {
      console.error('Order creation error:', error);
      setSubmitError(error.message || 'Failed to create order. Please try again.');
    }
  };

  if (step === 'sample') {
    return (
      <Card className="shadow-luxury">
        <CardHeader>
          <CardTitle>Select Your Sample</CardTitle>
          <CardDescription>Choose the design sample you prefer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProductSampleSelector
            selectedSample={selectedSample}
            onSelectSample={handleSampleSelect}
          />

          <Button
            onClick={handleContinue}
            disabled={!selectedSample}
            size="lg"
            className="w-full shadow-luxury"
          >
            Continue to Order Details
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-luxury">
      <CardHeader>
        <CardTitle>Complete Your Order</CardTitle>
        <CardDescription>
          Selected: {selectedSample} • {price} • {deliveryTime}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className={errors.dob ? 'border-destructive' : ''}
              />
              {errors.dob && <p className="text-sm text-destructive">{errors.dob}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.male}>Male</SelectItem>
                  <SelectItem value={Gender.female}>Female</SelectItem>
                  <SelectItem value={Gender.other}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-base font-medium">
                Shop / Brand Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brandName"
                type="text"
                placeholder="Enter your Shop / Brand Name"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className={errors.brandName ? 'border-destructive' : ''}
              />
              {errors.brandName && <p className="text-sm text-destructive">{errors.brandName}</p>}
            </div>

            <ProductOrderFormFields
              brandName={formData.brandName}
              description={formData.description}
              onBrandNameChange={(value) => setFormData({ ...formData, brandName: value })}
              onDescriptionChange={(value) => setFormData({ ...formData, description: value })}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('sample')}
              className="flex-1"
              disabled={addToCartMutation.isPending}
            >
              Back to Sample Selection
            </Button>
            <Button
              type="submit"
              disabled={addToCartMutation.isPending}
              className="flex-1 shadow-luxury"
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
