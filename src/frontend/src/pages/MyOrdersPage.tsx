import { useNavigate } from '@tanstack/react-router';
import { useGetCallerOrders } from '../hooks/useAddToCart';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle } from 'lucide-react';
import { OrderStatus, PaymentStatus } from '../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGetCallerOrders();
  const cancelOrderMutation = useCancelOrder();

  const getOrderStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case OrderStatus.confirmed:
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case OrderStatus.shipped:
        return <Truck className="h-5 w-5 text-blue-600" />;
      case OrderStatus.delivered:
        return <Package className="h-5 w-5 text-purple-600" />;
      case OrderStatus.cancelled:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [OrderStatus.pending]: 'secondary',
      [OrderStatus.confirmed]: 'default',
      [OrderStatus.shipped]: 'default',
      [OrderStatus.delivered]: 'default',
      [OrderStatus.cancelled]: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [PaymentStatus.pending]: 'secondary',
      [PaymentStatus.paidSubmitted]: 'outline',
      [PaymentStatus.verified]: 'default',
      [PaymentStatus.confirmed]: 'default',
      [PaymentStatus.failed]: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const canCancelOrder = (orderTimestamp: bigint): boolean => {
    const now = BigInt(Date.now()) * BigInt(1_000_000); // Convert to nanoseconds
    const hoursSinceOrder = Number((now - orderTimestamp) / BigInt(1_000_000_000 * 3600));
    return hoursSinceOrder <= 24;
  };

  const handleCancelOrder = async (orderId: bigint) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrderMutation.mutateAsync(orderId);
      } catch (error: any) {
        console.error('Cancel order error:', error);
      }
    }
  };

  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp / BigInt(1_000_000)));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 md:py-24 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">My Orders</h1>
          <p className="text-lg text-muted-foreground">
            View and manage your orders
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="shadow-luxury">
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start by exploring our services.
              </p>
              <Button onClick={() => navigate({ to: '/services' })}>
                Browse Services
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const canCancel = canCancelOrder(order.timestamp) && order.orderStatus !== OrderStatus.cancelled;
              
              return (
                <Card key={order.id.toString()} className="shadow-luxury">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getOrderStatusIcon(order.orderStatus)}
                          Order #{order.id.toString()}
                        </CardTitle>
                        <CardDescription>
                          Placed on {formatDate(order.timestamp)}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getOrderStatusBadge(order.orderStatus)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Product</p>
                        <p className="font-medium">{order.product}</p>
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
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{order.email}</p>
                      </div>
                    </div>

                    {order.brandName && (
                      <div>
                        <p className="text-sm text-muted-foreground">Brand Name</p>
                        <p className="font-medium">{order.brandName}</p>
                      </div>
                    )}

                    <Separator />

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate({ to: '/track-order/$orderId', params: { orderId: order.id.toString() } })}
                      >
                        Track Order
                      </Button>
                      
                      {canCancel ? (
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelOrderMutation.isPending}
                        >
                          {cancelOrderMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            'Cancel Order'
                          )}
                        </Button>
                      ) : order.orderStatus !== OrderStatus.cancelled && (
                        <Alert className="sm:flex-1">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Cancellation is only available within 24 hours of placing the order
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
