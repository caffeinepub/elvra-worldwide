import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetCallerOrders } from '../hooks/useAddToCart';
import { Loader2, Package, Truck, CheckCircle2, Clock, XCircle, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrderStatus, PaymentStatus } from '../backend';

export default function TrackOrderPage() {
  const { orderId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGetCallerOrders();

  const order = orders?.find((o) => o.id.toString() === orderId);

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

  const getOrderStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case OrderStatus.confirmed:
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case OrderStatus.shipped:
        return <Truck className="h-6 w-6 text-blue-600" />;
      case OrderStatus.delivered:
        return <Package className="h-6 w-6 text-purple-600" />;
      case OrderStatus.cancelled:
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getOrderStatusDescription = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return 'Your order is pending and awaiting confirmation.';
      case OrderStatus.confirmed:
        return 'Your order has been confirmed and is being prepared.';
      case OrderStatus.shipped:
        return 'Your order has been shipped and is on its way to you.';
      case OrderStatus.delivered:
        return 'Your order has been successfully delivered.';
      case OrderStatus.cancelled:
        return 'Your order has been cancelled.';
      default:
        return 'Order status unknown.';
    }
  };

  const getPaymentStatusDescription = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.pending:
        return 'Payment is pending.';
      case PaymentStatus.paidSubmitted:
        return 'Payment has been submitted and is awaiting verification.';
      case PaymentStatus.verified:
        return 'Payment has been verified by our team.';
      case PaymentStatus.confirmed:
        return 'Payment has been confirmed.';
      case PaymentStatus.failed:
        return 'Payment has failed. Please contact support.';
      default:
        return 'Payment status unknown.';
    }
  };

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Button
          onClick={() => navigate({ to: '/dashboard' })}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Track My Order</h1>
          <p className="text-lg text-muted-foreground">
            Order ID: #{order.id.toString()}
          </p>
        </div>

        <Card className="shadow-luxury mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Order Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-lg">Delivery Time: 3 Business Days</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your design is being prepared by our expert team
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Email Delivery</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We will send your design to <span className="font-medium text-foreground">{order.email}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-luxury mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {getOrderStatusIcon(order.orderStatus)}
              <div className="flex-1">
                <p className="font-medium text-lg capitalize">{order.orderStatus}</p>
                <p className="text-sm text-muted-foreground">
                  {getOrderStatusDescription(order.orderStatus)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Order Timeline</h3>
              <div className="space-y-3">
                <div className={`flex items-start gap-3 ${order.orderStatus === OrderStatus.pending ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`mt-1 rounded-full p-1 ${order.orderStatus === OrderStatus.pending ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-muted'}`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Pending</p>
                    <p className="text-sm text-muted-foreground">Order placed and awaiting confirmation</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${order.orderStatus === OrderStatus.confirmed ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`mt-1 rounded-full p-1 ${order.orderStatus === OrderStatus.confirmed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Confirmed</p>
                    <p className="text-sm text-muted-foreground">Order confirmed and being prepared</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${order.orderStatus === OrderStatus.shipped ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`mt-1 rounded-full p-1 ${order.orderStatus === OrderStatus.shipped ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-muted'}`}>
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Shipped</p>
                    <p className="text-sm text-muted-foreground">Order shipped and in transit</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${order.orderStatus === OrderStatus.delivered ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`mt-1 rounded-full p-1 ${order.orderStatus === OrderStatus.delivered ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-muted'}`}>
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Delivered</p>
                    <p className="text-sm text-muted-foreground">Order successfully delivered</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-luxury mb-6">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className="capitalize">
                  {order.paymentStatus}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getPaymentStatusDescription(order.paymentStatus)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-luxury">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{order.product}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Sample</p>
                <p className="font-medium">{order.sampleSelected}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brand Name</p>
                <p className="font-medium">{order.brandName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">{order.price}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Time</p>
                <p className="font-medium">{order.deliveryTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {new Date(Number(order.timestamp) / 1000000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
