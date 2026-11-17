import { useEffect, useMemo, useState } from "react";
import { IonRouterOutlet, IonTabs } from "@ionic/react";
import type { ReactElement } from "react";
import { useLocation } from "react-router-dom";

import { appConfig } from "../app.config";
import { AppTabBar } from "../design-system";
import type { AppTabConfig } from "../types/app-config";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useShoppingList } from "../contexts/ShoppingListContext";
import {
  PROFILE_SHOPPING_TAB_BADGE_EVENT,
  readProfileShoppingTabSuppress,
} from "../utils/profileShoppingTabBadge";
import GuestTabRoutes from "../routes/GuestTabRoutes";
import SignedInTabRoutes from "../routes/SignedInTabRoutes";
import { isTabRootPath } from "./isTabRootPath";

export interface TabNavigationProps {
  tabs?: AppTabConfig[];
  defaultTab?: string;
}

export function TabNavigation({
  tabs = appConfig.tabs,
  defaultTab = appConfig.defaultTab,
}: TabNavigationProps): ReactElement {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { unreadCount } = useNotifications();
  const { items: shoppingItems } = useShoppingList();
  const [profileTabShoppingSuppressed, setProfileTabShoppingSuppressed] =
    useState(readProfileShoppingTabSuppress);

  useEffect(() => {
    const sync = () =>
      setProfileTabShoppingSuppressed(readProfileShoppingTabSuppress());
    window.addEventListener(PROFILE_SHOPPING_TAB_BADGE_EVENT, sync);
    return () =>
      window.removeEventListener(PROFILE_SHOPPING_TAB_BADGE_EVENT, sync);
  }, []);

  const isOnProfilePage =
    pathname === "/profile" || pathname.startsWith("/profile/");

  const { shoppingPending, shoppingHasList } = useMemo(() => {
    const pending = shoppingItems.filter((line) => !line.checked).length;
    return {
      shoppingPending: pending,
      shoppingHasList: shoppingItems.length > 0,
    };
  }, [shoppingItems]);

  const showShoppingOnProfileTab =
    !profileTabShoppingSuppressed &&
    !isOnProfilePage &&
    (shoppingPending > 0 || shoppingHasList);

  const tabsWithBadges = useMemo((): AppTabConfig[] => {
    return tabs.map((tab) => {
      if (tab.id === "activity" && unreadCount > 0) {
        return {
          ...tab,
          badge: unreadCount > 99 ? "99+" : unreadCount,
        };
      }
      if (tab.id === "profile" && showShoppingOnProfileTab) {
        return {
          ...tab,
          badge:
            shoppingPending > 0
              ? shoppingPending > 99
                ? "99+"
                : shoppingPending
              : "•",
        };
      }
      return { ...tab, badge: undefined };
    });
  }, [tabs, unreadCount, showShoppingOnProfileTab, shoppingPending]);

  // Stack pages (add/edit recipe, detail, shopping, filters) are full-screen;
  // keep the glass tab bar only on tab roots.
  const hideTabBar = !isTabRootPath(pathname, tabs);

  return (
    <IonTabs>
      <IonRouterOutlet>
        {user ? <SignedInTabRoutes /> : <GuestTabRoutes />}
      </IonRouterOutlet>
      <AppTabBar
        tabs={tabsWithBadges}
        defaultTab={defaultTab}
        hidden={hideTabBar}
        profile={
          user
            ? { name: user.name, avatarUrl: user.avatarUrl }
            : { name: "Guest" }
        }
      />
    </IonTabs>
  );
}
