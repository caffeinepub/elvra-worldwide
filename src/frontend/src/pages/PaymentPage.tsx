import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetCallerOrders } from '../hooks/useAddToCart';
import { Loader2, CreditCard, Package, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function PaymentPage() {
  const { orderId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGetCallerOrders();

  const order = orders?.find((o) => o.id.toString() === orderId);

  const placeOrder = () => {
    alert("Payment gateway coming next (Stripe / Razorpay)");
    if (orderId) {
      navigate({ to: '/payment-success/$orderId', params: { orderId } });
    }
  };

  if (isLoading) {
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

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Complete Payment</h1>
          <p className="text-lg text-muted-foreground">
            Review your order details and proceed with payment
          </p>
        </div>

        <Card className="shadow-luxury mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Details
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
                <div className="flex items-center gap-2">
                  {order.paymentStatus === 'Pending' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-medium">
                      <CreditCard className="h-3 w-3" />
                      {order.paymentStatus}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      {order.paymentStatus}
                    </span>
                  )}
                </div>
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
                <p className="font-medium">{order.price}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Delivery Time</p>
                <p className="font-medium">{order.deliveryTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-luxury border-primary/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Checkout Information
            </CardTitle>
            <CardDescription>
              Please provide your details to complete the order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your Name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Number</Label>
              <Input id="phone" type="tel" placeholder="WhatsApp Number" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product Name</Label>
              <Input id="product" placeholder="Product Name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Design Requirements</Label>
              <Textarea 
                id="description" 
                placeholder="Your design requirements"
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-luxury border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment
            </CardTitle>
            <CardDescription>
              This is a demo payment flow. Click the button below to simulate payment completion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Demo Payment Information</p>
              <p className="text-sm text-muted-foreground">
                In a production environment, this would integrate with a real payment provider like Stripe or PayPal.
              </p>
            </div>

            <Button
              onClick={placeOrder}
              size="lg"
              className="w-full shadow-luxury"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Pay & Place Order
            </Button>

            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Cancel & Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
