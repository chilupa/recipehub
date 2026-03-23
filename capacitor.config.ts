import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chilupa.recipehub',
  appName: 'RecipeHub',
 webDir: "dist",
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    Keyboard: {
      // WebView resize when keyboard opens (esp. with edge-to-edge / status bar overlay)
      resizeOnFullScreen: true,
    },
  },
};

export default config;
