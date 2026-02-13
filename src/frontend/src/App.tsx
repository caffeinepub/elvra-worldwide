import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { Toaster } from '@/components/ui/sonner';

import BrandLayout from './components/BrandLayout';
import AuthGate from './components/AuthGate';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import BusinessCardPage from './pages/BusinessCardPage';
import LogoDesignPage from './pages/LogoDesignPage';
import ProductBannerPage from './pages/ProductBannerPage';
import PhotoFramePage from './pages/PhotoFramePage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import TrackOrderPage from './pages/TrackOrderPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <BrandLayout>
      <Outlet />
    </BrandLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: ServicesPage,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <AuthGate>
      <DashboardPage />
    </AuthGate>
  ),
});

const businessCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/business-card',
  component: BusinessCardPage,
});

const logoDesignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/logo-design',
  component: LogoDesignPage,
});

const productBannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/product-banner',
  component: ProductBannerPage,
});

const photoFrameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/photo-frame',
  component: PhotoFramePage,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment/$orderId',
  component: () => (
    <AuthGate>
      <PaymentPage />
    </AuthGate>
  ),
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: () => (
    <AuthGate>
      <PaymentSuccessPage />
    </AuthGate>
  ),
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: () => (
    <AuthGate>
      <PaymentFailurePage />
    </AuthGate>
  ),
});

const trackOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/track-order/$orderId',
  component: () => (
    <AuthGate>
      <TrackOrderPage />
    </AuthGate>
  ),
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: () => (
    <AuthGate>
      <OrderConfirmationPage />
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  servicesRoute,
  pricingRoute,
  contactRoute,
  loginRoute,
  signupRoute,
  dashboardRoute,
  businessCardRoute,
  logoDesignRoute,
  productBannerRoute,
  photoFrameRoute,
  paymentRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  trackOrderRoute,
  orderConfirmationRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <InternetIdentityProvider>
            <RouterProvider router={router} />
            <Toaster />
          </InternetIdentityProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
