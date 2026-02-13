import { ReactNode } from 'react';
import { useIsCallerAdmin } from '../hooks/useAdminOrderVerification';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface AdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminGate({ children, fallback }: AdminGateProps) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
}
