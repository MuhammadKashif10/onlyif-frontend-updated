import { useAuth as useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const auth = useAuthContext();
  
  const isAuthenticated = !!auth.user;
  const isBuyer = auth.user?.type === 'buyer';
  const isSeller = auth.user?.type === 'seller';
  const isAgent = auth.user?.type === 'agent';
  const isAdmin = auth.user?.type === 'admin';

  return {
    ...auth,
    isAuthenticated,
    isBuyer,
    isSeller,
    isAgent,
    isAdmin,
  };
} 