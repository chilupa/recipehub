import React from "react";
import {
  IonContent,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

import AppHeader from "../../../components/AppHeader";
import NoData from "../../../components/NoData";
import { AppButton, AppLoading, PageIntro } from "../../../design-system";
import { emptyActivity } from "../../../lib/emptyStateMessages";
import { useNotifications } from "../../../contexts/NotificationContext";
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

        <PageIntro
          title="Activity"
          description="Updates about your recipes, all in one place."
          endAction={
            unreadCount > 0 ? (
              <AppButton variant="text" onClick={() => markAllRead()}>
                Mark all read
              </AppButton>
            ) : null
          }
        />

        {unreadCount > 0 ? (
          <p className="activity-unread-hint text-caption">
            {unreadCount} unread
          </p>
        ) : null}

        {loading ? (
          <div className="ion-padding activity-loading">
            <AppLoading message="Loading activity…" />
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
