import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function BrandHeader() {
  const navigate = useNavigate();
  const { identity, clear, login, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/assets/generated/elvra-wordmark.dim_1200x300.png" 
              alt="Elvra Worldwide" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Services
            </Link>
            <Link 
              to="/pricing" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium px-4 py-2 rounded border border-border hover:bg-accent transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="text-sm font-medium transition-colors hover:text-primary disabled:opacity-50"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
                <Link
                  to="/signup"
                  className="text-sm font-medium px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-accent transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/pricing" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/contact" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-left transition-colors hover:text-primary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleLogin();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoggingIn}
                    className="text-sm font-medium text-left transition-colors hover:text-primary disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </button>
                  <Link
                    to="/signup"
                    className="text-sm font-medium text-left transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

