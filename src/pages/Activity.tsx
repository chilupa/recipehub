import React from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { heart } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { useNotifications } from "../contexts/NotificationContext";
const formatWhen = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

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
        <div
          className="ion-padding"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            paddingBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              {unreadCount > 0 && (
                <IonText color="medium">
                  <p style={{ margin: "4px 0 0", fontSize: 13 }}>
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
          <div
            className="ion-padding"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 40,
            }}
          >
            <IonSpinner name="crescent" />
            <IonText color="medium">
              <p style={{ marginTop: 12 }}>Loading activity…</p>
            </IonText>
          </div>
        ) : items.length === 0 ? (
          <div
            className="ion-padding"
            style={{
              textAlign: "center",
              paddingTop: 28,
              paddingBottom: 24,
              maxWidth: 320,
              marginInline: "auto",
            }}
          >
            <IonText color="medium">
              <p style={{ margin: 0, fontSize: "0.9375rem", lineHeight: 1.5 }}>
                No activity yet. Updates about your recipes will show up here.
              </p>
            </IonText>
          </div>
        ) : (
          <IonList lines="full" className="ion-no-padding">
            {items.map((n) => (
              <IonItem
                key={n.id}
                button
                detail={true}
                onClick={() => void openRecipe(n.id, n.recipeId)}
                style={{
                  "--background": n.read
                    ? "transparent"
                    : "var(--ion-color-light)",
                }}
              >
                <IonIcon icon={heart} color="danger" slot="start" />
                <IonLabel>
                  <h3 style={{ margin: "0 0 4px", fontWeight: 600 }}>
                    {n.actorName} saved your recipe
                  </h3>
                  <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>
                    {n.recipeTitle}
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 12,
                      color: "var(--ion-color-medium)",
                    }}
                  >
                    {formatWhen(n.createdAt)}
                  </p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Activity;
