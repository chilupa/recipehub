import { Capacitor } from "@capacitor/core";

/**
 * When the soft keyboard opens on Android, the WebView often doesn't scroll the
 * focused control into view. Scroll the active field after the keyboard animates.
 */
export function registerAndroidKeyboardScrollAssist(): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    return;
  }

  void (async () => {
    const { Keyboard } = await import("@capacitor/keyboard");
    await Keyboard.addListener("keyboardDidShow", () => {
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          const active = document.activeElement as HTMLElement | null;
          if (!active?.closest?.("ion-content")) return;
          const target =
            (active.closest("ion-textarea") as HTMLElement | null) ??
            (active.closest("ion-input") as HTMLElement | null) ??
            (active.closest("ion-item") as HTMLElement | null) ??
            active;
          target.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        }, 150);
      });
    });
  })();
}
