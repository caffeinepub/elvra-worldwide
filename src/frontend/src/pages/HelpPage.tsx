import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useSubmitSupportRequest } from '../hooks/useSupport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, CheckCircle2, HelpCircle, Package } from 'lucide-react';

export default function HelpPage() {
  const submitSupportMutation = useSubmitSupportRequest();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      await submitSupportMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Support request error:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Help & Support</h1>
          <p className="text-lg text-muted-foreground">
            We're here to help with any questions or concerns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-luxury">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Order Cancellation</CardTitle>
                  <CardDescription>Cancel within 24 hours</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You can cancel your order within 24 hours of placing it directly from the My Orders page.
              </p>
              <Link to="/my-orders">
                <Button variant="outline" className="w-full">
                  Go to My Orders
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-luxury">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Need More Help?</CardTitle>
                  <CardDescription>Contact our support team</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For other inquiries, please fill out the support form below and we'll get back to you as soon as possible.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-luxury">
          <CardHeader>
            <CardTitle>Submit a Support Request</CardTitle>
            <CardDescription>
              Tell us how we can help you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitSuccess && (
              <Alert className="mb-6 border-green-600 bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Request Submitted</AlertTitle>
                <AlertDescription className="text-green-600">
                  Thank you for contacting us. We'll respond to your request shortly.
                </AlertDescription>
              </Alert>
            )}

            {submitSupportMutation.isError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to submit your request. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Describe your issue or question"
                  rows={6}
                  className={errors.message ? 'border-destructive' : ''}
                />
                {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={submitSupportMutation.isPending}
                className="w-full shadow-luxury"
                size="lg"
              >
                {submitSupportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
