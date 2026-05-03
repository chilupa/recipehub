import React from "react";
import {
  IonButton,
  IonContent,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import NoData from "../../components/NoData";
import { emptyActivity } from "../../lib/emptyStateMessages";
import { useNotifications } from "../../contexts/NotificationContext";
import ActivityNotificationItem from "./ActivityNotificationItem";
import "./Activity.css";

const Activity: React.FC = () => {
  const { items, loading, unreadCount, markRead, markAllRead, refresh } =
    useNotifications();
  const history = useHistory();

  const openRecipe = async (id: string, recipeId: string) => {
    await markRead(id);
    history.push(`/recipes/recipe/${recipeId}`);
  };

  return (
    <IonPage>
      <AppHeader title="RecipeHub" />
      <IonContent fullscreen>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            await refresh();
            e.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <div className="ion-padding activity-toolbar">
          <div className="activity-toolbar__unread-row">
            <div>
              {unreadCount > 0 && (
                <IonText color="medium">
                  <p className="activity-toolbar__unread-text">
                    {unreadCount} unread
                  </p>
                </IonText>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <IonButton size="small" fill="clear" onClick={() => markAllRead()}>
              Mark all read
            </IonButton>
          )}
        </div>

        {loading ? (
          <div className="ion-padding activity-loading">
            <IonSpinner name="crescent" />
            <IonText color="medium">
              <p className="activity-loading__hint">Loading activity…</p>
            </IonText>
          </div>
        ) : items.length === 0 ? (
          <div className="ion-padding activity-empty">
            <NoData {...emptyActivity} />
          </div>
        ) : (
          <IonList lines="full" className="ion-no-padding">
            {items.map((n) => (
              <ActivityNotificationItem
                key={n.id}
                item={n}
                onOpen={openRecipe}
              />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Activity;
