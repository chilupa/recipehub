import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { getHapticsEnabled } from "./hapticsSettings";

export async function playFavoriteToggleHaptics(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (!getHapticsEnabled()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* native layer unavailable or permission */
  }
}
