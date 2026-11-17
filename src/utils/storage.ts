import { Preferences } from '@capacitor/preferences';

export async function getStorageItem(key: string): Promise<string | null> {
  const result = await Preferences.get({ key });
  return result.value;
}

export async function setStorageItem(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

export async function removeStorageItem(key: string): Promise<void> {
  await Preferences.remove({ key });
}

export async function getStorageJson<T>(key: string): Promise<T | null> {
  const value = await getStorageItem(key);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setStorageJson<T>(key: string, value: T): Promise<void> {
  await setStorageItem(key, JSON.stringify(value));
}
