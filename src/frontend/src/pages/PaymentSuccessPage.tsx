import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetStripeSessionStatus, useVerifyPaymentAndConfirmOrder } from '../hooks/useStripeVerification';
import { useGetCallerOrders } from '../hooks/useAddToCart';
import { getUrlParameter } from '../utils/urlParams';
import { CheckCircle2, Loader2, AlertCircle, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const getSessionStatus = useGetStripeSessionStatus();
  const verifyPayment = useVerifyPaymentAndConfirmOrder();
  const { data: orders } = useGetCallerOrders();
  const [verificationState, setVerificationState] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const verifyStripePayment = async () => {
      try {
        // Get session ID from URL
        const sessionId = getUrlParameter('session_id');
        if (!sessionId) {
          setErrorMessage('No payment session found. Please try again.');
          setVerificationState('error');
          return;
        }

        // Get orderId from sessionStorage
        const storedOrderId = sessionStorage.getItem('pendingPaymentOrderId');
        if (!storedOrderId) {
          setErrorMessage('Order information not found. Please contact support.');
          setVerificationState('error');
          return;
        }
        setOrderId(storedOrderId);

        // Check Stripe session status
        const sessionStatus = await getSessionStatus.mutateAsync(sessionId);
        
        if (sessionStatus.__kind__ === 'completed') {
          // Verify payment and confirm order
          await verifyPayment.mutateAsync(BigInt(storedOrderId));
          
          // Set success marker for order confirmation page
          sessionStorage.setItem(`payment_completed_${storedOrderId}`, 'true');
          sessionStorage.removeItem('pendingPaymentOrderId');
          
          setVerificationState('success');
          
          // Navigate to order confirmation page after a brief delay
          setTimeout(() => {
            navigate({ 
              to: '/order-confirmation/$orderId', 
              params: { orderId: storedOrderId } 
            });
          }, 2000);
        } else if (sessionStatus.__kind__ === 'failed') {
          setErrorMessage(sessionStatus.failed.error || 'Payment verification failed. Please contact support.');
          setVerificationState('error');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setErrorMessage(error.message || 'An error occurred during payment verification. Please contact support.');
        setVerificationState('error');
      }
    };

    verifyStripePayment();
  }, [getSessionStatus, verifyPayment, navigate]);

  if (verificationState === 'checking') {
    return (
      <div className="min-h-screen py-16 md:py-24 flex items-center justify-center">
        <Card className="shadow-luxury max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <div>
              <h2 className="text-2xl font-semibold mb-2">Verifying Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment with Stripe...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationState === 'success') {
    return (
      <div className="min-h-screen py-16 md:py-24 flex items-center justify-center">
        <Card className="shadow-luxury max-w-md w-full border-green-500/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground">
                Redirecting you to your order confirmation...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Verification Failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        <Card className="shadow-luxury">
          <CardHeader>
            <CardTitle>What should I do?</CardTitle>
            <CardDescription>
              If you believe this is an error, please contact our support team with your order details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderId && (
              <Button
                onClick={() => navigate({ to: '/track-order/$orderId', params: { orderId } })}
                className="w-full"
                size="lg"
              >
                <Package className="mr-2 h-4 w-4" />
                View Order Details
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
