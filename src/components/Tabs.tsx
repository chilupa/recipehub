import { IonBadge, IonIcon, IonLabel, IonTabBar, IonTabButton } from "@ionic/react";
import { heart, home, notifications, person } from "ionicons/icons";
import { useNotifications } from "../contexts/NotificationContext";

const Tabs = () => {
  const { unreadCount } = useNotifications();

  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="recipes" href="/recipes">
        <IonIcon aria-hidden="true" icon={home} />
        <IonLabel>Recipes</IonLabel>
      </IonTabButton>
      <IonTabButton tab="favorites" href="/favorites">
        <IonIcon aria-hidden="true" icon={heart} />
        <IonLabel>Favorites</IonLabel>
      </IonTabButton>
      <IonTabButton tab="activity" href="/activity">
        <IonIcon aria-hidden="true" icon={notifications} />
        <IonLabel>Activity</IonLabel>
        {unreadCount > 0 ? (
          <IonBadge color="danger">{unreadCount > 99 ? "99+" : unreadCount}</IonBadge>
        ) : null}
      </IonTabButton>
      <IonTabButton tab="profile" href="/profile">
        <IonIcon aria-hidden="true" icon={person} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default Tabs;
