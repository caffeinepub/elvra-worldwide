import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useServices } from '../hooks/useServices';
import { useGetSupportRequests } from '../hooks/useSupport';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useAddToCart, useGetCallerOrders } from '../hooks/useAddToCart';
import { useIsCallerAdmin, useVerifyPaymentAndConfirmOrder } from '../hooks/useAdminOrderVerification';
import ServiceCard from '../components/ServiceCard';
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
import { mapServiceToDisplay } from '../constants/premiumServices';

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

  const canTrackOrder = (order: any) => {
    return order.paymentStatus === PaymentStatus.verified && order.orderStatus === OrderStatus.confirmed;
  };

  const handleVerifyPayment = async (orderId: bigint) => {
    if (confirm('Are you sure you want to verify this payment and confirm the order?')) {
      try {
        await verifyPaymentMutation.mutateAsync(orderId);
        alert('Payment verified and order confirmed successfully!');
      } catch (error) {
        alert('Failed to verify payment. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, {userProfile?.fullName || 'User'}! Manage your orders and profile.
          </p>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <Card className="mb-8 border-primary/30 shadow-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin: Payment Verification
              </CardTitle>
              <CardDescription>
                Verify payments and confirm orders for customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders
                    .filter(order => order.paymentStatus === PaymentStatus.paidSubmitted)
                    .map((order) => (
                      <Card key={order.id.toString()} className="border-blue-200 dark:border-blue-800">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">Order #{order.id.toString()}</p>
                                {getPaymentStatusBadge(order.paymentStatus)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Customer: {order.name} | Product: {order.product}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Email: {order.email} | Phone: {order.phone}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleVerifyPayment(order.id)}
                              disabled={verifyPaymentMutation.isPending}
                              className="shadow-luxury"
                            >
                              {verifyPaymentMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Verify & Confirm
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {orders.filter(order => order.paymentStatus === PaymentStatus.paidSubmitted).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No orders awaiting verification
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No orders to display
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* My Orders Section */}
        <Card className="mb-8 shadow-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              My Orders
            </CardTitle>
            <CardDescription>View and track your orders</CardDescription>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id.toString()} className="border-muted">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">Order #{order.id.toString()}</p>
                            {getOrderStatusBadge(order.orderStatus)}
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.product} - {order.sampleSelected}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Price: {order.price} | Delivery: {order.deliveryTime}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {canTrackOrder(order) ? (
                            <Button
                              onClick={() => navigate({ to: '/track-order/$orderId', params: { orderId: order.id.toString() } })}
                              variant="outline"
                              size="sm"
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              Track Order
                            </Button>
                          ) : (
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Tracking available after verification</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No orders yet. Start by selecting a service below!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card className="mb-8 shadow-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Available Services
            </CardTitle>
            <CardDescription>Select a service to get started</CardDescription>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services?.map((service) => {
                  const displayInfo = mapServiceToDisplay(service.name);
                  return (
                    <div key={service.id.toString()} onClick={() => handleServiceSelect(service)}>
                      <ServiceCard
                        icon={displayInfo?.icon}
                        name={service.name}
                        priceLabel={displayInfo?.priceLabel || `$${service.priceUSD}`}
                        deliveryTime={service.deliveryTime}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Form */}
        {formData.product && (
          <Card className="mb-8 shadow-luxury border-primary/20">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Fill in your order information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value as Gender)}>
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
                  <Label htmlFor="sample">Select Sample</Label>
                  <Select value={formData.selectedSample} onValueChange={(value) => handleInputChange('selectedSample', value)}>
                    <SelectTrigger id="sample">
                      <SelectValue placeholder="Choose a sample" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sample 1">Sample 1</SelectItem>
                      <SelectItem value="Sample 2">Sample 2</SelectItem>
                      <SelectItem value="Sample 3">Sample 3</SelectItem>
                      <SelectItem value="Sample 4">Sample 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  placeholder="Enter your brand name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your requirements (max 1000 words)"
                  className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-sm text-muted-foreground">
                  {wordCount} / 1000 words
                </p>
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Order Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{formData.product}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium text-primary">{formData.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span className="font-medium">{formData.deliveryTime}</span>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="w-full shadow-luxury"
                size="lg"
              >
                {addToCartMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart & Proceed to Payment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Support Requests Section */}
        <Card className="mb-8 shadow-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Support Requests
            </CardTitle>
            <CardDescription>Your support request history</CardDescription>
          </CardHeader>
          <CardContent>
            {supportRequests && supportRequests.length > 0 ? (
              <div className="space-y-4">
                {supportRequests.map((request, index) => (
                  <Card key={index} className="border-muted">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{request.name}</p>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                        <p className="text-sm">{request.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Number(request.timestamp) / 1000000).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No support requests yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* User Profile Section */}
        <Card className="shadow-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            {userProfile ? (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Full Name:</span>
                  <span className="text-sm font-medium">{userProfile.fullName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium">{userProfile.email}</span>
                </div>
                {userProfile.mobileNumber && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Mobile:</span>
                    <span className="text-sm font-medium">{userProfile.mobileNumber}</span>
                  </div>
                )}
                {userProfile.dob && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Date of Birth:</span>
                    <span className="text-sm font-medium">{userProfile.dob}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Verification Status:</span>
                  <Badge variant={userProfile.isVerified ? "default" : "outline"}>
                    {userProfile.isVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No profile information available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
