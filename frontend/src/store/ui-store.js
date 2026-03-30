import { create } from "zustand";
import { persist } from "zustand/middleware";

const createToastId = () => Math.random().toString(36).slice(2, 10);

export const useUiStore = create(
  persist(
    (set, get) => ({
      theme: "dark",
      mobileNavOpen: false,
      toasts: [],
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark"
        })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      pushToast: ({ title, description, tone = "neutral", duration = 3200 }) => {
        const id = createToastId();
        set((state) => ({
          toasts: [...state.toasts, { id, title, description, tone }]
        }));

        window.setTimeout(() => {
          get().dismissToast(id);
        }, duration);
      },
      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id)
        }))
    }),
    {
      name: "lexguard-ui-preferences",
      partialize: (state) => ({ theme: state.theme })
    }
  )
);
