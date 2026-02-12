import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import BrandLayout from './components/BrandLayout';
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
import AuthGate from './components/AuthGate';

const rootRoute = createRootRoute({
  component: () => (
    <BrandLayout>
      <Outlet />
    </BrandLayout>
  )
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: ServicesPage
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <AuthGate>
      <DashboardPage />
    </AuthGate>
  )
});

const businessCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/business-card',
  component: BusinessCardPage
});

const logoDesignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/logo-design',
  component: LogoDesignPage
});

const productBannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product-banner',
  component: ProductBannerPage
});

const photoFrameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/photo-frame',
  component: PhotoFramePage
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment/$orderId',
  component: () => (
    <AuthGate>
      <PaymentPage />
    </AuthGate>
  )
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success/$orderId',
  component: () => (
    <AuthGate>
      <PaymentSuccessPage />
    </AuthGate>
  )
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  servicesRoute,
  pricingRoute,
  contactRoute,
  loginRoute,
  signUpRoute,
  dashboardRoute,
  businessCardRoute,
  logoDesignRoute,
  productBannerRoute,
  photoFrameRoute,
  paymentRoute,
  paymentSuccessRoute
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
