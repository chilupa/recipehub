import { IonTabBar, IonTabButton } from "@ionic/react";
import type { ReactElement } from "react";
import { useLocation } from "react-router-dom";

import type { AppTabConfig } from "../../../types/app-config";
import { AppAvatar } from "../AppAvatar";
import { AppIcon } from "../AppIcon";

import "./AppTabBar.css";

export interface AppTabBarProfile {
  name: string;
  avatarUrl?: string;
}

export interface AppTabBarProps {
  tabs: AppTabConfig[];
  /** Tab id used when the current path does not match any tab */
  defaultTab?: string;
  /** Profile tab avatar; when omitted, uses initials from "Guest" */
  profile?: AppTabBarProfile | null;
  /** Hide on pushed full-page stack screens (add/edit recipe, detail, etc.). */
  hidden?: boolean;
}

export function AppTabBar({
  tabs,
  defaultTab,
  profile,
  hidden = false,
}: AppTabBarProps): ReactElement {
  const location = useLocation();
  const profileName = profile?.name ?? "Guest";
  const profileAvatar = profile?.avatarUrl;

  const matchedTab = tabs.find((tab) => location.pathname.startsWith(tab.href));
  // My recipes lives under Profile browse, not as its own tab.
  const onProfileBrowse = /^\/myrecipes\/?$/.test(location.pathname);
  const activeTabId = onProfileBrowse
    ? (tabs.find((tab) => tab.kind === "profile" || tab.id === "profile")?.id ??
      matchedTab?.id ??
      defaultTab ??
      tabs[0]?.id)
    : (matchedTab?.id ?? defaultTab ?? tabs[0]?.id);

  return (
    <IonTabBar
      slot="bottom"
      aria-hidden={hidden || undefined}
      className={[
        "app-tab-bar",
        "app-tab-bar--glass",
        hidden ? "app-tab-bar--hidden" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const iconName = isActive ? (tab.iconActive ?? tab.icon) : tab.icon;
        const showBadge =
          tab.badge !== undefined && tab.badge !== 0 && tab.badge !== "0";
        const kind = tab.kind ?? "default";

        return (
          <IonTabButton
            key={tab.id}
            tab={tab.id}
            href={tab.href}
            selected={isActive}
            aria-label={
              showBadge
                ? `${tab.label}, ${String(tab.badge)} notifications`
                : tab.label
            }
            className={[
              "app-tab-bar__button",
              `app-tab-bar__button--${kind}`,
              isActive ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {kind === "profile" ? (
              <span
                className={
                  isActive
                    ? "app-tab-bar__profile-wrap is-active"
                    : "app-tab-bar__profile-wrap"
                }
              >
                <AppAvatar name={profileName} src={profileAvatar} size="sm" />
                {showBadge ? (
                  <span className="app-tab-bar__badge" aria-hidden="true">
                    {tab.badge}
                  </span>
                ) : null}
              </span>
            ) : kind === "create" ? (
              <span
                className={
                  isActive ? "app-tab-bar__create is-active" : "app-tab-bar__create"
                }
              >
                <AppIcon name={iconName} size="sm" />
              </span>
            ) : (
              <span className="app-tab-bar__icon-wrap">
                <AppIcon name={iconName} size="md" />
                {showBadge ? (
                  <span className="app-tab-bar__badge" aria-hidden="true">
                    {tab.badge}
                  </span>
                ) : null}
              </span>
            )}
          </IonTabButton>
        );
      })}
    </IonTabBar>
  );
}
