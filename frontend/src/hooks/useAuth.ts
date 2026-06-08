import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  status: string;
  trialEndsAt: string | null;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, tenant: Tenant, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  token: null,
  isLoading: true,
  setAuth: (user, tenant, token) => {
    localStorage.setItem('koda_token', token);
    set({ user, tenant, token });
  },
  logout: () => {
    localStorage.removeItem('koda_token');
    set({ user: null, tenant: null, token: null });
  },
  setUser: (user) => set({ user }),
}));
