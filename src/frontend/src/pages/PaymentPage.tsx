import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetCallerOrders } from '../hooks/useAddToCart';
import { useCreateCheckoutSession } from '../hooks/useCreateCheckoutSession';
import { useIsStripeConfigured } from '../hooks/useStripeConfiguration';
import { orderToShoppingItems } from '../utils/stripeOrderMapping';
import { Loader2, CreditCard, Package, FileText, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PaymentStatus } from '../backend';
import { useState } from 'react';

export default function PaymentPage() {
  const { orderId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGetCallerOrders();
  const { data: isStripeConfigured, isLoading: isCheckingStripe } = useIsStripeConfigured();
  const createCheckoutSession = useCreateCheckoutSession();
  const [error, setError] = useState<string | null>(null);

  const order = orders?.find((o) => o.id.toString() === orderId);

  const handlePayment = async () => {
    if (!order) return;
    
    setError(null);
    
    try {
      // Convert order to shopping items
      const items = orderToShoppingItems(order);
      
      // Create checkout session
      const session = await createCheckoutSession.mutateAsync(items);
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      
      // Store orderId in sessionStorage for return handling
      sessionStorage.setItem('pendingPaymentOrderId', orderId || '');
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
    }
  };

  if (isLoading || isCheckingStripe) {
    return (
      <div className="min-h-screen py-16 md:py-24 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Order Not Found</CardTitle>
              <CardDescription>
                The order you're looking for doesn't exist or you don't have permission to view it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate({ to: '/dashboard' })}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.pending:
        return (
          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case PaymentStatus.paidSubmitted:
        return (
          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        );
      case PaymentStatus.verified:
        return (
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300">
            Verified
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Complete Payment</h1>
          <p className="text-lg text-muted-foreground">
            Review your order details and complete payment via Stripe
          </p>
        </div>

        {!isStripeConfigured && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment System Not Configured</AlertTitle>
            <AlertDescription>
              Stripe payment is not configured. Please contact the administrator to set up payment processing.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-luxury mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Summary
            </CardTitle>
            <CardDescription>Order ID: #{order.id.toString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-medium text-lg">{order.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-lg">{order.email}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium text-lg">{order.product}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Selected Sample</p>
                <p className="font-medium text-lg">{order.sampleSelected}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Brand Name</p>
                <p className="font-medium">{order.brandName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
            </div>

            {order.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Description</span>
                  </div>
                  <p className="text-sm leading-relaxed">{order.description}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium text-2xl text-primary">{order.price}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Delivery Time</p>
                <p className="font-medium">{order.deliveryTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-luxury border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Secure Payment via Stripe
            </CardTitle>
            <CardDescription>
              You will be redirected to Stripe's secure checkout to complete your payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Secure Payment Processing</p>
              <p className="text-sm text-muted-foreground">
                Your payment is processed securely through Stripe. We never store your card details.
              </p>
            </div>

            <Button
              onClick={handlePayment}
              size="lg"
              className="w-full shadow-luxury"
              disabled={!isStripeConfigured || createCheckoutSession.isPending}
            >
              {createCheckoutSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Payment
                </>
              )}
            </Button>

            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              variant="outline"
              size="lg"
              className="w-full"
              disabled={createCheckoutSession.isPending}
            >
              Cancel & Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
