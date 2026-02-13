import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn, isLoginError, loginError } = useInternetIdentity();

  useEffect(() => {
    if (identity && !identity.getPrincipal().isAnonymous()) {
      navigate({ to: '/my-orders' });
    }
  }, [identity, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your orders and manage your projects.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-luxury">
          {isLoginError && loginError && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
              {loginError.message}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <LogIn className="h-5 w-5" />
            {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => navigate({ to: '/signup' })}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Secure authentication powered by Internet Identity.
          </p>
        </div>
      </div>
    </div>
  );
}
