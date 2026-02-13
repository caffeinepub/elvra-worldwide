import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveBasicProfile, useGetCallerUserProfile } from '../hooks/useUserProfile';
import { UserPlus } from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: existingProfile, isFetched, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveBasicProfileMutation = useSaveBasicProfile();

  const [step, setStep] = useState<'auth' | 'profile'>('auth');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    if (isAuthenticated) {
      if (isFetched && existingProfile) {
        navigate({ to: '/my-orders' });
      } else if (isFetched && !profileLoading) {
        setStep('profile');
      }
    }
  }, [isAuthenticated, existingProfile, isFetched, profileLoading, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await saveBasicProfileMutation.mutateAsync({
        fullName: formData.fullName,
        email: formData.email
      });

      navigate({ to: '/my-orders' });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errors[e.target.name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  if (step === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold mb-4">Create Account</h1>
            <p className="text-muted-foreground">
              Join Elvra Worldwide and start your design journey.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-luxury">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <UserPlus className="h-5 w-5" />
              {isLoggingIn ? 'Connecting...' : 'Sign up with Internet Identity'}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => navigate({ to: '/login' })}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Please provide your details to complete registration.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-luxury">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={saveBasicProfileMutation.isPending}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saveBasicProfileMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
