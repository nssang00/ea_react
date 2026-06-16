import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  currentPage: 'projects',

  login: ({ email }) =>
    set({
      user: {
        id: 'u-1',
        name: email?.split('@')[0] || 'Admin',
        email,
        role: 'Admin',
      },
      currentPage: 'projects',
    }),

  logout: () => set({ user: null, currentPage: 'projects' }),
  setPage: (page) => set({ currentPage: page }),
}));
