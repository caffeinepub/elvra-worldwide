import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useUpdateOrderPaymentStatus } from '../hooks/useOrderPayment';
import { useGetCallerOrders } from '../hooks/useAddToCart';
import { CheckCircle2, Loader2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const { orderId } = useParams({ strict: false });
  const navigate = useNavigate();
  const updatePaymentMutation = useUpdateOrderPaymentStatus();
  const { data: orders, refetch } = useGetCallerOrders();
  const [hasUpdated, setHasUpdated] = useState(false);

  const order = orders?.find((o) => o.id.toString() === orderId);

  useEffect(() => {
    if (orderId && !hasUpdated && !updatePaymentMutation.isPending) {
      setHasUpdated(true);
      updatePaymentMutation.mutate(
        { orderId: BigInt(orderId), status: 'Completed' },
        {
          onSuccess: () => {
            refetch();
          },
          onError: (error) => {
            console.error('Payment status update failed:', error);
          }
        }
      );
    }
  }, [orderId, hasUpdated, updatePaymentMutation]);

  if (updatePaymentMutation.isPending || !order) {
    return (
      <div className="min-h-screen py-16 md:py-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (updatePaymentMutation.isError) {
    return (
      <div className="min-h-screen py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <Card className="border-destructive shadow-luxury">
            <CardHeader>
              <CardTitle className="text-destructive">Payment Update Failed</CardTitle>
              <CardDescription>
                There was an error updating your payment status. Please contact support.
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

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">
            Your order has been confirmed and payment has been processed successfully.
          </p>
        </div>

        <Card className="shadow-luxury mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Confirmation
            </CardTitle>
            <CardDescription>Order ID: #{order.id.toString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">What's Next?</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>We will start working on your order immediately</li>
                <li>You will receive updates via email at {order.email}</li>
                <li>Expected delivery time: {order.deliveryTime}</li>
                <li>You can track your order status in the Dashboard</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate({ to: '/dashboard' })}
            size="lg"
            className="flex-1 shadow-luxury"
          >
            View My Orders
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={() => navigate({ to: '/' })}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
