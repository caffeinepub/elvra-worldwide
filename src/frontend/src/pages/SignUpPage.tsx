import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile, useGetCallerUserProfile } from '../hooks/useUserProfile';
import { Gender } from '../backend';
import OtpDemoField from '../components/OtpDemoField';
import { UserPlus } from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: existingProfile, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  const [step, setStep] = useState<'auth' | 'profile'>('auth');
  const [otpVerified, setOtpVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    countryCode: '+1',
    dob: '',
    gender: 'male' as 'male' | 'female' | 'other'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (identity && !identity.getPrincipal().isAnonymous()) {
      if (isFetched && existingProfile) {
        navigate({ to: '/dashboard' });
      } else if (isFetched) {
        setStep('profile');
      }
    }
  }, [identity, existingProfile, isFetched, navigate]);

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

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    }

    if (!otpVerified) {
      newErrors.otp = 'Please verify your OTP';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
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
      const genderMap: Record<string, Gender> = {
        male: Gender.male,
        female: Gender.female,
        other: Gender.other
      };

      await saveProfileMutation.mutateAsync({
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: `${formData.countryCode} ${formData.mobileNumber}`,
        dob: formData.dob,
        gender: genderMap[formData.gender],
        isVerified: otpVerified
      });

      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
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
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
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
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mobile Number *
              </label>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="px-4 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+86">+86 (CN)</option>
                  <option value="+81">+81 (JP)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+33">+33 (FR)</option>
                </select>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className="flex-1 px-4 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {errors.mobileNumber && (
                <p className="mt-1 text-sm text-destructive">{errors.mobileNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                OTP Verification *
              </label>
              <OtpDemoField onVerified={setOtpVerified} />
              {errors.otp && (
                <p className="mt-1 text-sm text-destructive">{errors.otp}</p>
              )}
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-destructive">{errors.dob}</p>
              )}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-2">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saveProfileMutation.isPending}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saveProfileMutation.isPending ? 'Creating Profile...' : 'Complete Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

