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
          setErrorMessage(sessionStatus.failed.error || 'Payment verification failed');
          setVerificationState('error');
        } else {
          setErrorMessage('Payment status could not be verified');
          setVerificationState('error');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setErrorMessage(error.message || 'Failed to verify payment. Please contact support.');
        setVerificationState('error');
      }
    };

    verifyStripePayment();
  }, []);

  if (verificationState === 'checking') {
    return (
      <div className="min-h-screen py-16 md:py-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Verifying your payment...</p>
          <p className="text-sm text-muted-foreground">Please wait while we confirm your transaction</p>
        </div>
      </div>
    );
  }

  if (verificationState === 'error') {
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
              <CardTitle>What to do next?</CardTitle>
              <CardDescription>
                If you believe this is an error, please contact our support team with your order details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate({ to: '/dashboard' })}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
              {orderId && (
                <Button
                  onClick={() => navigate({ to: '/payment/$orderId', params: { orderId } })}
                  variant="outline"
                  className="w-full"
                >
                  Try Payment Again
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Card className="shadow-luxury border-green-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Payment Verified!</CardTitle>
            <CardDescription className="text-base">
              Your payment has been successfully verified and your order is confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Redirecting you to order confirmation...
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
