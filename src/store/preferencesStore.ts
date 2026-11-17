import { create } from 'zustand';

import { getStorageJson, setStorageJson } from '../utils/storage';

export interface UserPreferences {
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  notificationsEnabled: boolean;
}

interface PreferencesState extends UserPreferences {
  isHydrated: boolean;
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => Promise<void>;
  hydrate: () => Promise<void>;
}

const defaults: UserPreferences = {
  hapticsEnabled: true,
  reduceMotion: false,
  notificationsEnabled: true,
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...defaults,
  isHydrated: false,
  setPreference: async (key, value) => {
    const next = { ...get(), [key]: value };
    const payload: UserPreferences = {
      hapticsEnabled: next.hapticsEnabled,
      reduceMotion: next.reduceMotion,
      notificationsEnabled: next.notificationsEnabled,
    };
    await setStorageJson('user_preferences', payload);
    set({ [key]: value } as Partial<PreferencesState>);
  },
  hydrate: async () => {
    const stored = await getStorageJson<UserPreferences>('user_preferences');
    set({
      ...(stored ?? defaults),
      isHydrated: true,
    });
  },
}));
