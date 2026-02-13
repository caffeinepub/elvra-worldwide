import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useServices } from '../hooks/useServices';
import { useGetSupportRequests } from '../hooks/useSupport';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useAddToCart, useGetCallerOrders } from '../hooks/useAddToCart';
import { useIsCallerAdmin, useVerifyPaymentAndConfirmOrder } from '../hooks/useAdminOrderVerification';
import ServiceCard from '../components/ServiceCard';
import AdminGate from '../components/AdminGate';
import ProductBannerSamplesAdminPanel from '../components/admin/ProductBannerSamplesAdminPanel';
import { Package, MessageSquare, User, ShoppingCart, Truck, CheckCircle2, Clock, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Gender, OrderStatus, PaymentStatus } from '../backend';
import { validateDescription, countWords } from '../utils/validation';
import { getPremiumServiceByName } from '../constants/premiumServices';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: supportRequests } = useGetSupportRequests();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: orders } = useGetCallerOrders();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const verifyPaymentMutation = useVerifyPaymentAndConfirmOrder();
  
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
    price: '',
    deliveryTime: '',
    product: ''
  });

  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setWordCount(countWords(formData.description));
  }, [formData.description]);

  const handleInputChange = (field: string, value: string | Gender) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceSelect = (service: any) => {
    setFormData(prev => ({
      ...prev,
      product: service.name,
      price: `$${service.priceUSD}`,
      deliveryTime: service.deliveryTime
    }));
  };

  const handleAddToCart = () => {
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      alert('Please enter your email');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    if (!formData.dob.trim()) {
      alert('Please enter your date of birth');
      return;
    }
    if (!formData.gender) {
      alert('Please select your gender');
      return;
    }
    if (!formData.product) {
      alert('Please select a service');
      return;
    }
    if (!formData.selectedSample) {
      alert('Please select a sample');
      return;
    }
    if (!formData.brandName.trim()) {
      alert('Please enter your brand name');
      return;
    }

    const validationError = validateDescription(formData.description);
    if (validationError) {
      alert(validationError);
      return;
    }

    addToCartMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      gender: formData.gender as Gender,
      product: formData.product,
      sampleSelected: formData.selectedSample,
      brandName: formData.brandName,
      description: formData.description,
      price: formData.price,
      deliveryTime: formData.deliveryTime
    });
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Pending</Badge>;
      case OrderStatus.confirmed:
        return <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Confirmed</Badge>;
      case OrderStatus.shipped:
        return <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">Shipped</Badge>;
      case OrderStatus.delivered:
        return <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">Delivered</Badge>;
      case OrderStatus.cancelled:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.pending:
        return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Pending</Badge>;
      case PaymentStatus.paidSubmitted:
        return <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">Submitted</Badge>;
      case PaymentStatus.verified:
        return <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Verified</Badge>;
      case PaymentStatus.confirmed:
        return <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Confirmed</Badge>;
      case PaymentStatus.failed:
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleVerifyPayment = async (orderId: bigint) => {
    try {
      await verifyPaymentMutation.mutateAsync(orderId);
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  };

  const handleTrackOrder = (orderId: bigint) => {
    navigate({ to: '/track-order/$orderId', params: { orderId: orderId.toString() } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-serif text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Manage your orders and account</p>
        </div>

        <AdminGate>
          <Card className="border-primary/20 shadow-luxury">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Admin Panel</CardTitle>
              </div>
              <CardDescription>Administrative tools and settings</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <ProductBannerSamplesAdminPanel />
              
              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Verification</h3>
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders
                      .filter(order => order.paymentStatus === PaymentStatus.paidSubmitted)
                      .map(order => (
                        <div key={order.id.toString()} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Order #{order.id.toString()}</p>
                            <p className="text-sm text-muted-foreground">{order.name} - {order.product}</p>
                          </div>
                          <Button
                            onClick={() => handleVerifyPayment(order.id)}
                            disabled={verifyPaymentMutation.isPending}
                            size="sm"
                          >
                            {verifyPaymentMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Verify Payment
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    {orders.filter(order => order.paymentStatus === PaymentStatus.paidSubmitted).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No pending payment verifications</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No orders to verify</p>
                )}
              </div>
            </CardContent>
          </Card>
        </AdminGate>

        <Card className="shadow-luxury">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle>Order Tracking</CardTitle>
            </div>
            <CardDescription>Track your orders and view delivery status</CardDescription>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => {
                  const canTrack = order.paymentStatus === PaymentStatus.verified && order.orderStatus === OrderStatus.confirmed;
                  return (
                    <div key={order.id.toString()} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold">Order #{order.id.toString()}</p>
                          <p className="text-sm text-muted-foreground">{order.product}</p>
                          <p className="text-sm text-muted-foreground">{order.price} • {order.deliveryTime}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {getOrderStatusBadge(order.orderStatus)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleTrackOrder(order.id)}
                        disabled={!canTrack}
                        variant={canTrack ? 'default' : 'outline'}
                        size="sm"
                        className="w-full"
                      >
                        {canTrack ? (
                          <>
                            <Package className="mr-2 h-4 w-4" />
                            Track Order
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Awaiting Payment Verification
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-luxury">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <CardTitle>Available Services</CardTitle>
            </div>
            <CardDescription>Browse and order our premium design services</CardDescription>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : services && services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map(service => {
                  const premiumService = getPremiumServiceByName(service.name);
                  const icon = premiumService?.icon || '';
                  const priceLabel = `$${service.priceUSD}`;
                  
                  return (
                    <ServiceCard
                      key={service.id.toString()}
                      icon={icon}
                      name={service.name}
                      priceLabel={priceLabel}
                      deliveryTime={service.deliveryTime}
                      action={
                        <Button
                          onClick={() => handleServiceSelect(service)}
                          size="sm"
                          className="w-full shadow-luxury"
                        >
                          Select Service
                        </Button>
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No services available</p>
            )}
          </CardContent>
        </Card>

        {formData.product && (
          <Card className="shadow-luxury">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>Create Order</CardTitle>
              </div>
              <CardDescription>
                Selected: {formData.product} • {formData.price} • {formData.deliveryTime}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value as Gender)}
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

                <div className="space-y-2">
                  <Label htmlFor="sample">Sample Selection *</Label>
                  <Select
                    value={formData.selectedSample}
                    onValueChange={(value) => handleInputChange('selectedSample', value)}
                  >
                    <SelectTrigger id="sample">
                      <SelectValue placeholder="Select a sample" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sample1">Sample 1</SelectItem>
                      <SelectItem value="sample2">Sample 2</SelectItem>
                      <SelectItem value="sample3">Sample 3</SelectItem>
                      <SelectItem value="sample4">Sample 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandName">Shop / Brand Name *</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  placeholder="Enter your Shop / Brand Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your requirements..."
                  rows={5}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-sm text-muted-foreground text-right">{wordCount} / 1000 words</p>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                size="lg"
                className="w-full shadow-luxury"
              >
                {addToCartMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart & Proceed
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-luxury">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Support Requests</CardTitle>
            </div>
            <CardDescription>Your submitted support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {supportRequests && supportRequests.length > 0 ? (
              <div className="space-y-4">
                {supportRequests.map((request, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold">{request.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Number(request.timestamp) / 1000000).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <p className="text-sm">{request.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No support requests</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-luxury">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>User Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            {userProfile ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{userProfile.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{userProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{userProfile.mobileNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{userProfile.dob || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No profile information</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
