import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonText,
  IonList,
  useIonRouter,
} from "@ionic/react";
import { logOutOutline, bookOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";

import AppHeader from "../components/AppHeader";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { recipesTotalCount, recipesLoading } = useRecipes();
  const ionRouter = useIonRouter();
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState({
    show: false,
    message: "",
    color: "secondary",
  });

  const hasChanges = () => {
    return name.trim() !== originalName.trim();
  };

  const handleLogout = () => {
    logout();
    ionRouter.push("/login", "root", "replace");
  };

  useEffect(() => {
    if (user) {
      const profileName = user.name || "";
      setName(profileName);
      setOriginalName(profileName);
    }
  }, [user]);

  const saveProfile = async () => {
    if (!user || !name.trim()) {
      setShowToast({
        show: true,
        message: "Please enter your name",
        color: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const nextName = name.trim();
      await updateUser({ name: nextName });

      // Notify RecipeContext to update already-loaded authors.
      window.dispatchEvent(
        new CustomEvent("profile:updated", {
          detail: { userId: user.id, displayName: nextName },
        }),
      );

      setOriginalName(name.trim());
      setShowToast({
        show: true,
        message: "Profile updated",
        color: "success",
      });
    } catch {
      setShowToast({
        show: true,
        message: "Error updating profile",
        color: "danger",
      });
    }
    setLoading(false);
  };

  const displayName = name || user?.name || user?.email || "User";

  return (
    <IonPage>
      <AppHeader  />
      <IonContent className="ion-padding">
        {/* Profile card */}
        <div
          style={{
            marginTop: 8,
            marginBottom: 24,
            padding: "24px 20px",
            borderRadius: 12,
            background: "var(--ion-color-light)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <UserAvatar name={displayName} size={88} color="primary" />
            <IonItem
              lines="none"
              style={{
                width: "100%",
                "--background": "transparent",
                "--padding-start": 0,
                "--inner-padding-end": 0,
              }}
            >
              <IonLabel position="stacked">Name</IonLabel>
              <IonInput
                value={name}
                onIonInput={(e) => setName(e.detail.value ?? "")}
                placeholder="Enter your name"
                clearOnEdit={false}
              />
            </IonItem>
            {user?.email && (
              <IonText color="medium" style={{ fontSize: 14, width: "100%" }}>
                {user.email}
              </IonText>
            )}
          <IonButton
            expand="block"
            onClick={saveProfile}
            disabled={loading || !hasChanges()}
            style={{ width: "100%", marginTop: 8 }}
          >
            {loading ? "Saving…" : "Save profile"}
          </IonButton>
        </div>

        {/* Stats */}
        <IonList lines="none" style={{ marginBottom: 24 }}>
          <IonItem>
            <IonIcon icon={bookOutline} slot="start" color="primary" />
            <IonLabel>
              <strong>
                {recipesLoading || recipesTotalCount === null
                  ? "…"
                  : recipesTotalCount}
              </strong>{" "}
              {recipesLoading || recipesTotalCount === null
                ? "recipes"
                : `recipe${recipesTotalCount !== 1 ? "s" : ""}`}
            </IonLabel>
          </IonItem>
        </IonList>

        {/* Sign out */}
        <IonList lines="none">
          <IonItem
            button
            detail={false}
            onClick={handleLogout}
            style={{ "--background": "transparent" }}
          >
            <IonIcon icon={logOutOutline} slot="start" color="danger" />
            <IonLabel color="danger">Sign out</IonLabel>
          </IonItem>
        </IonList>

        <IonToast
          isOpen={showToast.show}
          onDidDismiss={() => setShowToast((s) => ({ ...s, show: false }))}
          message={showToast.message}
          duration={3000}
          color={showToast.color}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
