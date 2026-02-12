import { useInternetIdentity } from './useInternetIdentity';

export function useAuthState() {
  const { identity, isInitializing } = useInternetIdentity();
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = identity?.getPrincipal().toString();

  return {
    isAuthenticated,
    principal,
    isInitializing,
    identity
  };
}

