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
import "./Tabs.css";

const Tabs = () => {
  const { unreadCount } = useNotifications();

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
      <IonTabButton tab="profile" href="/profile" aria-label="Profile">
        <IonIcon aria-hidden="true" icon={personCircleOutline} />
      </IonTabButton>
    </IonTabBar>
  );
};

export default Tabs;
