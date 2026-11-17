import { useEffect, useState } from "react";

import { appConfig } from "../app.config";
import { applyBrandTheme } from "../design-system";
import { configureKeyboard } from "../services/native/keyboard";
import { usePreferencesStore } from "../store/preferencesStore";
import { useThemeStore } from "../store/themeStore";

export function useAppBootstrap(): { ready: boolean } {
  const [ready, setReady] = useState(false);
  const hydrateTheme = useThemeStore((state) => state.hydrate);
  const hydratePreferences = usePreferencesStore((state) => state.hydrate);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      applyBrandTheme(appConfig);
      await Promise.all([
        hydrateTheme(appConfig.defaultTheme),
        hydratePreferences(),
        configureKeyboard(),
      ]);

      if (!cancelled) {
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydratePreferences, hydrateTheme]);

  return { ready };
}
