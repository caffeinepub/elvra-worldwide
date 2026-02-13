import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetCallerOrders } from '../hooks/useAddToCart';
import { CheckCircle2, Loader2, Home, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGetCallerOrders();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const order = orders?.find((o) => o.id.toString() === orderId);

  useEffect(() => {
    // Check if user completed payment for this order
    const paymentCompleted = sessionStorage.getItem(`payment_completed_${orderId}`);
    if (paymentCompleted === 'true') {
      setIsAuthorized(true);
      // Clear the flag after checking
      sessionStorage.removeItem(`payment_completed_${orderId}`);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 md:py-24 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized || !order) {
    return (
      <div className="min-h-screen py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              This page is only accessible after completing a payment. Please complete your order first.
            </AlertDescription>
          </Alert>

          <Card className="shadow-luxury">
            <CardContent className="pt-6">
              <Button
                onClick={() => navigate({ to: '/dashboard' })}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Card className="shadow-luxury border-green-500/20 mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-4xl font-serif mb-2">Order Confirmed!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your order. Your payment has been received and everything is confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-lg mb-2">What happens next?</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your design will arrive in your email within <span className="font-medium text-foreground">3 business days</span>. 
                    We appreciate your trust and look forward to delivering something you'll love.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  If you have any feedback after receiving your design, we'd be happy to hear it.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">#{order.id.toString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{order.product}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Delivery Time</p>
                <p className="font-medium">{order.deliveryTime}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                onClick={() => navigate({ to: '/track-order/$orderId', params: { orderId: orderId || '' } })}
                className="flex-1"
                size="lg"
              >
                <Package className="mr-2 h-4 w-4" />
                Track My Order
              </Button>
              <Button
                onClick={() => navigate({ to: '/' })}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Explore Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
