import { useAuthStore } from '../stores/useAuthStore.js';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const currentPage = useAuthStore((state) => state.currentPage);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setPage = useAuthStore((state) => state.setPage);

  return {
    user,
    currentPage,
    login,
    logout,
    setPage,
    isAuthenticated: Boolean(user),
  };
}
