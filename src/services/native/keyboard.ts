import { Keyboard } from '@capacitor/keyboard';

import { isNativePlatform } from '../../utils/platform';

export async function configureKeyboard(): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    await Keyboard.setAccessoryBarVisible({ isVisible: true });
  } catch {
    // Keyboard plugin may be unavailable on some platforms.
  }
}
