import { create } from 'zustand';

import { configureStatusBar } from '../services/native/statusBar';
import type { ThemeMode } from '../types/app-config';
import { getStorageItem, setStorageItem } from '../utils/storage';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  isHydrated: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  hydrate: (fallback: ThemeMode) => Promise<void>;
}

function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function applyDomTheme(resolved: 'light' | 'dark'): void {
  document.body.classList.toggle('dark', resolved === 'dark');
  document.documentElement.classList.toggle('ion-palette-dark', resolved === 'dark');
  void configureStatusBar(resolved === 'dark');
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  resolved: 'light',
  isHydrated: false,
  setMode: async (mode) => {
    const resolved = resolveMode(mode);
    await setStorageItem('theme_mode', mode);
    applyDomTheme(resolved);
    set({ mode, resolved });
  },
  hydrate: async (fallback) => {
    const stored = (await getStorageItem('theme_mode')) as ThemeMode | null;
    const mode = stored ?? fallback;
    const resolved = resolveMode(mode);
    applyDomTheme(resolved);
    set({ mode, resolved, isHydrated: true });

    if (mode === "system" && typeof window.matchMedia === "function") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        if (get().mode !== "system") {
          return;
        }
        const next = resolveMode("system");
        applyDomTheme(next);
        set({ resolved: next });
      };
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", onChange);
      } else if (typeof media.addListener === "function") {
        media.addListener(onChange);
      }
    }
  },
}));
