import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { IonBadge, IonIcon, IonTabBar, IonTabButton } from "@ionic/react";
import {
  heart,
  home,
  listCircle,
  search,
  notifications,
  personCircleOutline,
} from "ionicons/icons";
import { useNotifications } from "../contexts/NotificationContext";
import { useShoppingList } from "../contexts/ShoppingListContext";
import {
  PROFILE_SHOPPING_TAB_BADGE_EVENT,
  readProfileShoppingTabSuppress,
} from "../utils/profileShoppingTabBadge";
import "./Tabs.css";

const Tabs = () => {
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
    const pending = shoppingItems.filter((l) => !l.checked).length;
    return {
      shoppingPending: pending,
      shoppingHasList: shoppingItems.length > 0,
    };
  }, [shoppingItems]);

  /**
   * Tab badge: hidden while on Profile, and after visiting Profile until new
   * items are added. Count stays on the Shopping list row on Profile.
   */
  const showShoppingOnProfileTab =
    !profileTabShoppingSuppressed &&
    !isOnProfilePage &&
    (shoppingPending > 0 || shoppingHasList);

  const profileAriaLabel =
    isOnProfilePage || profileTabShoppingSuppressed
      ? "Profile"
      : shoppingPending > 0
        ? `Profile, ${shoppingPending} shopping list ${
            shoppingPending === 1 ? "item" : "items"
          } to buy`
        : shoppingHasList
          ? "Profile, shopping list has items"
          : "Profile";

  return (
    <IonTabBar slot="bottom" className="app-tab-bar">
      <IonTabButton tab="recipes" href="/recipes" aria-label="Recipes">
        <IonIcon aria-hidden="true" icon={home} />
      </IonTabButton>
      <IonTabButton tab="myrecipes" href="/myrecipes" aria-label="My recipes">
        <IonIcon aria-hidden="true" icon={listCircle} />
      </IonTabButton>
      <IonTabButton tab="search" href="/search" aria-label="Search recipes">
        <IonIcon aria-hidden="true" icon={search} />
      </IonTabButton>
      <IonTabButton tab="favorites" href="/favorites" aria-label="Favorites">
        <IonIcon aria-hidden="true" icon={heart} />
      </IonTabButton>
      <IonTabButton tab="activity" href="/activity" aria-label="Activity">
        <IonIcon aria-hidden="true" icon={notifications} />
        {unreadCount > 0 ? (
          <IonBadge color="danger">{unreadCount > 99 ? "99+" : unreadCount}</IonBadge>
        ) : null}
      </IonTabButton>
      <IonTabButton tab="profile" href="/profile" aria-label={profileAriaLabel}>
        <IonIcon aria-hidden="true" icon={personCircleOutline} />
        {showShoppingOnProfileTab && shoppingPending > 0 ? (
          <IonBadge color="primary">
            {shoppingPending > 99 ? "99+" : shoppingPending}
          </IonBadge>
        ) : showShoppingOnProfileTab && shoppingHasList ? (
          <span
            className="app-tab-profile-shopping-dot"
            title="Shopping list"
            aria-hidden
          />
        ) : null}
      </IonTabButton>
    </IonTabBar>
  );
};

export default Tabs;
