import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useServices } from '../hooks/useServices';
import { useGetSupportRequests } from '../hooks/useSupport';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useAddToCart, useGetCallerOrders } from '../hooks/useAddToCart';
import ServiceCard from '../components/ServiceCard';
import { Package, MessageSquare, User, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gender, OrderStatus } from '../backend';

export default function DashboardPage() {
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: supportRequests } = useGetSupportRequests();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: orders } = useGetCallerOrders();
  const addToCartMutation = useAddToCart();

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

  // Handle URL search params for prefilling sample name
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sampleName = params.get('sample');
    if (sampleName) {
      setFormData((prev) => ({ ...prev, selectedSample: sampleName }));
      // Scroll to form
      document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
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

    // Validate description word count
    const wordCount = formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 1000) {
      alert('Description exceeds 1000 words limit');
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

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Dashboard</h1>
          {userProfile && (
            <p className="text-lg text-muted-foreground">Welcome back, {userProfile.fullName}</p>
          )}
        </div>

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
                    <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
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
                    placeholder="e.g., Business Card Design"
                  />
                  {errors.selectedSample && (
                    <p className="text-sm text-destructive mt-1">{errors.selectedSample}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="brandName">
                    Shop / Brand Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="brandName"
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Enter your shop or brand name"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">
                    Description <span className="text-muted-foreground">(max 1000 words)</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your requirements..."
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.trim().split(/\s+/).filter(word => word.length > 0).length} / 1000 words
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={addToCartMutation.isPending}
                className="w-full md:w-auto"
              >
                {addToCartMutation.isPending ? 'Adding to Cart...' : 'Add to Cart'}
              </Button>
            </form>
          </div>
        </section>

        {/* My Orders Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold">My Orders</h2>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id.toString()}
                    className="p-4 bg-accent/20 rounded border border-border"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{order.product}</p>
                        <p className="text-sm text-muted-foreground">Order #{order.id.toString()}</p>
                      </div>
                      <span className={`text-sm font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                        {getOrderStatusLabel(order.orderStatus)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><span className="font-medium">Brand:</span> {order.brandName}</p>
                      <p><span className="font-medium">Payment Status:</span> {order.paymentStatus}</p>
                      <p><span className="font-medium">Name:</span> {order.name}</p>
                      <p><span className="font-medium">Email:</span> {order.email}</p>
                      {order.phone && <p><span className="font-medium">Phone:</span> {order.phone}</p>}
                      <p className="mt-2">
                        <span className="font-medium">Ordered:</span> {new Date(Number(order.timestamp) / 1000000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">No orders yet. Place your first order above!</p>
            )}
          </div>
        </section>

        {/* Support Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold">Support</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
              <p className="text-muted-foreground mb-6">
                Our support team is here to assist you with any questions or concerns.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </Link>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Your Support Requests</h3>
              {supportRequests && supportRequests.length > 0 ? (
                <div className="space-y-3">
                  {supportRequests.slice(0, 3).map((request, index) => (
                    <div key={index} className="p-3 bg-accent/20 rounded border border-border">
                      <p className="text-sm text-muted-foreground mb-1">
                        {new Date(Number(request.timestamp) / 1000000).toLocaleDateString()}
                      </p>
                      <p className="text-sm line-clamp-2">{request.message}</p>
                    </div>
                  ))}
                  {supportRequests.length > 3 && (
                    <Link to="/contact" className="text-sm text-primary hover:underline">
                      View all requests
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No support requests yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* Profile Section */}
        {userProfile && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-serif font-bold">Profile Information</h2>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium">{userProfile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mobile Number</p>
                  <p className="font-medium">{userProfile.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verification Status</p>
                  <p className="font-medium">
                    {userProfile.isVerified ? (
                      <span className="text-primary">✓ Verified</span>
                    ) : (
                      <span className="text-muted-foreground">Not Verified</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
