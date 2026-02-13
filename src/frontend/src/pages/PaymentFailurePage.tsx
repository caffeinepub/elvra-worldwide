import { useNavigate } from '@tanstack/react-router';
import { XCircle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem('pendingPaymentOrderId');
    if (storedOrderId) {
      setOrderId(storedOrderId);
    }
  }, []);

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Card className="shadow-luxury border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-3xl">Payment Cancelled</CardTitle>
            <CardDescription className="text-base">
              Your payment was not completed. No charges have been made to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                You can try again or return to your orders to review your order.
              </p>
            </div>

            <div className="space-y-3">
              {orderId && (
                <Button
                  onClick={() => navigate({ to: '/payment/$orderId', params: { orderId } })}
                  className="w-full"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try Payment Again
                </Button>
              )}
              
              <Button
                onClick={() => navigate({ to: '/my-orders' })}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to My Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
