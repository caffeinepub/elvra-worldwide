import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useServices } from '../hooks/useServices';
import { useGetSupportRequests } from '../hooks/useSupport';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useAddToCart, useGetCallerOrders } from '../hooks/useAddToCart';
import ServiceCard from '../components/ServiceCard';
import { Package, MessageSquare, User, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gender, OrderStatus } from '../backend';
import { validateDescription, countWords } from '../utils/validation';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: supportRequests } = useGetSupportRequests();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: orders } = useGetCallerOrders();
  
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '' as Gender | '',
    selectedSample: '',
    brandName: '',
    description: '',
  });

  const [orderSelection, setOrderSelection] = useState<{
    productName: string;
    price: number;
    delivery: string;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill form with user profile data
  useEffect(() => {
    if (userProfile) {
      setFormData((prev) => ({
        ...prev,
        name: userProfile.fullName,
        email: userProfile.email,
        phone: userProfile.mobileNumber,
        dob: userProfile.dob,
        gender: userProfile.gender,
      }));
    }
  }, [userProfile]);

  // Handle URL search params for prefilling sample name and order selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sampleName = params.get('sample');
    
    // Check for order selection from sessionStorage
    const storedSelection = sessionStorage.getItem('orderSelection');
    if (storedSelection) {
      try {
        const selection = JSON.parse(storedSelection);
        setOrderSelection(selection);
        // Clear from sessionStorage after reading
        sessionStorage.removeItem('orderSelection');
        
        // Scroll to order section after a brief delay to ensure DOM is ready
        setTimeout(() => {
          document.getElementById('orderSection')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (e) {
        console.error('Failed to parse order selection:', e);
      }
    }
    
    if (sampleName) {
      setFormData((prev) => ({ ...prev, selectedSample: sampleName }));
      // Only scroll to form if no order selection (to avoid double scroll)
      if (!storedSelection) {
        document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const handleServiceOrder = (serviceName: string) => {
    setFormData((prev) => ({ ...prev, selectedSample: serviceName }));
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.selectedSample.trim()) {
      newErrors.selectedSample = 'Sample name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate brand name
    if (!formData.brandName.trim()) {
      alert('Please enter your Shop / Brand Name');
      return;
    }

    // Validate description using shared validation
    const descValidation = validateDescription(formData.description);
    if (!descValidation.isValid) {
      alert(descValidation.message);
      return;
    }

    if (!validateForm()) {
      return;
    }

    addToCartMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      gender: formData.gender as Gender,
      product: formData.selectedSample,
      sampleSelected: formData.selectedSample,
      brandName: formData.brandName,
      description: formData.description,
      price: 'Depends on requirement',
      deliveryTime: '3 Days',
    });
  };

  const serviceIcons: Record<string, string> = {
    'Business Card Design': '/assets/generated/business-card-icon.dim_256x256.png',
    'Logo Design': '/assets/generated/logo-design-icon.dim_256x256.png',
    'Photo Frame Design': '/assets/generated/photo-frame-icon.dim_256x256.png',
  };

  const getOrderStatusLabel = (status: OrderStatus) => {
    const statusMap: Record<OrderStatus, string> = {
      [OrderStatus.pending]: 'Pending',
      [OrderStatus.confirmed]: 'Confirmed',
      [OrderStatus.shipped]: 'Shipped',
      [OrderStatus.delivered]: 'Delivered',
      [OrderStatus.cancelled]: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getOrderStatusColor = (status: OrderStatus) => {
    const colorMap: Record<OrderStatus, string> = {
      [OrderStatus.pending]: 'text-yellow-600',
      [OrderStatus.confirmed]: 'text-blue-600',
      [OrderStatus.shipped]: 'text-purple-600',
      [OrderStatus.delivered]: 'text-green-600',
      [OrderStatus.cancelled]: 'text-red-600',
    };
    return colorMap[status] || 'text-muted-foreground';
  };

  const wordCount = countWords(formData.description);

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Dashboard</h1>
          {userProfile && (
            <p className="text-lg text-muted-foreground">Welcome back, {userProfile.fullName}</p>
          )}
        </div>

        {/* Order Selection Summary Section */}
        {orderSelection && (
          <div id="orderSection" className="mb-12 scroll-mt-24">
            <h2>Order This Product</h2>

            <p><strong>Product:</strong> <span id="selectedProduct">{orderSelection.productName}</span></p>
            <p><strong>Price:</strong> <span id="selectedPrice">${orderSelection.price}</span></p>
            <p><strong>Delivery Time:</strong> <span id="selectedDelivery">{orderSelection.delivery}</span></p>
          </div>
        )}

        {/* Services Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold">Available Services</h2>
          </div>

          {servicesLoading ? (
            <div className="flex justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services?.map((service) => (
                <ServiceCard
                  key={service.id.toString()}
                  icon={serviceIcons[service.name]}
                  name={service.name}
                  priceRange={service.priceRange}
                  deliveryTime={service.deliveryTime}
                  action={
                    <button
                      onClick={() => handleServiceOrder(service.name)}
                      className="w-full px-4 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Order Service
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Add to Cart Form */}
        <section className="mb-12" id="order-form">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold">Add to Cart</h2>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                  >
                    <SelectTrigger id="gender" className={errors.gender ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.male}>Male</SelectItem>
                      <SelectItem value={Gender.female}>Female</SelectItem>
                      <SelectItem value={Gender.other}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <Label htmlFor="selectedSample">
                    Sample Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="selectedSample"
                    type="text"
                    value={formData.selectedSample}
                    onChange={(e) => setFormData({ ...formData, selectedSample: e.target.value })}
                    className={errors.selectedSample ? 'border-destructive' : ''}
                  />
                  {errors.selectedSample && (
                    <p className="text-sm text-destructive mt-1">{errors.selectedSample}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="brandName">
                  Shop / Brand Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="brandName"
                  type="text"
                  placeholder="Enter your Shop / Brand Name"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Detailed Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe your requirement (up to 1000 words)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                <p id="wordCount" className="text-sm text-muted-foreground mt-1">
                  {wordCount} / 1000
                </p>
              </div>

              <Button type="submit" disabled={addToCartMutation.isPending} className="w-full md:w-auto">
                {addToCartMutation.isPending ? 'Adding to Cart...' : 'Add to Cart & Proceed'}
              </Button>
            </form>
          </div>
        </section>

        {/* Checkout Section (hidden by default, revealed after successful add-to-cart) */}
        <section id="checkoutSection" style={{ display: 'none' }} className="mb-12 scroll-mt-24">
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">Checkout</h2>
            <p className="text-muted-foreground">
              Your order has been added to cart. Proceeding to payment...
            </p>
          </div>
        </section>

        {/* My Orders Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold">My Orders</h2>
          </div>

          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id.toString()} className="bg-card border border-border rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-medium">#{order.id.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium">{order.product}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Brand Name</p>
                      <p className="font-medium">{order.brandName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sample Selected</p>
                      <p className="font-medium">{order.sampleSelected}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Status</p>
                      <p className={`font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                        {getOrderStatusLabel(order.orderStatus)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <p className="font-medium">{order.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          )}
        </section>

        {/* Support Requests Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold">My Support Requests</h2>
          </div>

          {supportRequests && supportRequests.length > 0 ? (
            <div className="space-y-4">
              {supportRequests.map((request, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{request.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{request.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Message</p>
                      <p className="font-medium">{request.message}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-medium">
                        {new Date(Number(request.timestamp) / 1000000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No support requests yet</p>
            </div>
          )}
        </section>

        {/* User Profile Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold">My Profile</h2>
          </div>

          {userProfile ? (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{userProfile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="font-medium">{userProfile.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{userProfile.dob}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{userProfile.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <p className="font-medium">{userProfile.isVerified ? 'Verified' : 'Not Verified'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No profile information available</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
