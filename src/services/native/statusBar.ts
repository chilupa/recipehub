import { StatusBar, Style } from '@capacitor/status-bar';

import { isNativePlatform } from '../../utils/platform';

export async function configureStatusBar(isDark: boolean): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  } catch {
    // Status bar configuration is best-effort.
  }
}
