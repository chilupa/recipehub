import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

import { isNativePlatform } from './platform';

export async function hapticImpact(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    await Haptics.impact({ style });
  } catch {
    // Haptics are best-effort on unsupported devices.
  }
}

export async function hapticNotification(
  type: NotificationType = NotificationType.Success,
): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    await Haptics.notification({ type });
  } catch {
    // no-op
  }
}

export async function hapticSelection(): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  } catch {
    // no-op
  }
}
