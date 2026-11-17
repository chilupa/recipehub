import type { IconName } from "../design-system/icons/iconRegistry";

export type ThemeMode = "light" | "dark" | "system";

export type AppTabKind = "default" | "create" | "profile";

export interface AppTabConfig {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  iconActive?: IconName;
  badge?: number | string;
  /** Special tab treatment: create button or profile avatar */
  kind?: AppTabKind;
}

export interface AppBrandConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoSrc?: string;
}

export interface AppConfig {
  appName: string;
  brand: AppBrandConfig;
  defaultTheme: ThemeMode;
  /** Tab id used for the initial redirect */
  defaultTab: string;
  tabs: AppTabConfig[];
}
