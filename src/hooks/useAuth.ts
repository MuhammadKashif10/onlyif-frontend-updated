import { useAuth as useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const auth = useAuthContext();
  
  const isAuthenticated = !!auth.user;
  const currentRole = auth.activeRole || auth.user?.role || auth.user?.type || null;
  const isBuyer = currentRole === 'buyer';
  const isSeller = currentRole === 'seller';
  const isAgent = currentRole === 'agent';
  const isAdmin = currentRole === 'admin';

  return {
    ...auth,
    isAuthenticated,
    currentRole,
    isBuyer,
    isSeller,
    isAgent,
    isAdmin,
  };
} 
