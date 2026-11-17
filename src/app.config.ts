import type { AppConfig } from "./types/app-config";

/**
 * Central branding and navigation configuration.
 * Customize without touching design-system components.
 */
export const appConfig: AppConfig = {
  appName: "RecipeHub",
  brand: {
    primaryColor: "#b8451a",
    secondaryColor: "#5c7c3e",
    fontFamily: "'Source Sans 3', 'Segoe UI', sans-serif",
    logoSrc: "/favicon.png",
  },
  defaultTheme: "system",
  defaultTab: "recipes",
  // Keep the glass tab bar at 5 items max. "My recipes" stays reachable from Profile.
  tabs: [
    {
      id: "recipes",
      label: "Recipes",
      href: "/recipes",
      icon: "homeOutline",
      iconActive: "home",
    },
    {
      id: "search",
      label: "Search",
      href: "/search",
      icon: "searchOutline",
      iconActive: "search",
    },
    {
      id: "favorites",
      label: "Favorites",
      href: "/favorites",
      icon: "heartOutline",
      iconActive: "heart",
    },
    {
      id: "activity",
      label: "Activity",
      href: "/activity",
      icon: "notificationsOutline",
      iconActive: "notifications",
    },
    {
      id: "profile",
      label: "Profile",
      href: "/profile",
      icon: "personOutline",
      iconActive: "person",
      kind: "profile",
    },
  ],
};
