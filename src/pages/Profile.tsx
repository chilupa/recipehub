import React, { useState, useEffect, useRef } from "react";
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
  IonIcon,
  IonNote,
  useIonRouter,
} from "@ionic/react";
import {
  logOutOutline,
  bookOutline,
  heartOutline,
  notificationsOutline,
  createOutline,
} from "ionicons/icons";

import AppHeader from "../components/AppHeader";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import "./Profile.css";

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const {
    recipesTotalCount,
    recipesLoading,
    favoriteRecipes,
    favoritesLoading,
  } = useRecipes();
  const ionRouter = useIonRouter();
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<HTMLIonInputElement>(null);
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

  useEffect(() => {
    if (!editingName) return;
    const t = requestAnimationFrame(() => {
      void nameInputRef.current?.setFocus();
    });
    return () => cancelAnimationFrame(t);
  }, [editingName]);

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

      window.dispatchEvent(
        new CustomEvent("profile:updated", {
          detail: { userId: user.id, displayName: nextName },
        }),
      );

      setOriginalName(name.trim());
      setEditingName(false);
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

  const cancelNameEdit = () => {
    setName(originalName);
    setEditingName(false);
  };

  const displayName = name || user?.name || user?.email || "User";

  const readOnlyNameLabel =
    originalName.trim() ||
    user?.name?.trim() ||
    user?.email ||
    "Add your name";

  const feedCountLabel =
    recipesLoading || recipesTotalCount === null
      ? "…"
      : String(recipesTotalCount);

  const favoritesCountLabel = favoritesLoading ? "…" : String(favoriteRecipes.length);

  return (
    <IonPage className="profile-page">
      <AppHeader />
      <IonContent className="ion-padding">
        <div className="profile-card">
          <UserAvatar name={displayName} size={88} color="primary" />
          <div className="profile-name-block">
            <span className="profile-name-caption">Name</span>
            {editingName ? (
              <>
                <IonItem
                  lines="none"
                  style={{
                    width: "100%",
                    "--background": "transparent",
                    "--padding-start": 0,
                    "--inner-padding-end": 0,
                  }}
                >
                  <IonInput
                    ref={nameInputRef}
                    value={name}
                    onIonInput={(e) => setName(e.detail.value ?? "")}
                    placeholder="Your display name"
                    clearOnEdit={false}
                    maxlength={80}
                  />
                </IonItem>
                <div className="profile-name-actions">
                  <IonButton
                    fill="clear"
                    color="medium"
                    onClick={cancelNameEdit}
                    disabled={loading}
                  >
                    Cancel
                  </IonButton>
                  <IonButton
                    onClick={() => void saveProfile()}
                    disabled={loading || !hasChanges() || !name.trim()}
                  >
                    {loading ? "Saving…" : "Save"}
                  </IonButton>
                </div>
              </>
            ) : (
              <div className="profile-name-row">
                <span className="profile-name-display">{readOnlyNameLabel}</span>
                <IonButton
                  fill="clear"
                  size="small"
                  aria-label="Edit name"
                  onClick={() => setEditingName(true)}
                  style={{ margin: 0, flexShrink: 0 }}
                >
                  <IonIcon slot="icon-only" icon={createOutline} />
                </IonButton>
              </div>
            )}
          </div>
          {user?.email && (
            <IonText color="medium" style={{ fontSize: 14, width: "100%" }}>
              {user.email}
            </IonText>
          )}
        </div>

        <p className="profile-section-label">Browse</p>
        <div className="profile-links">
          <IonList lines="none">
            <IonItem button detail routerLink="/recipes">
              <IonIcon icon={bookOutline} slot="start" color="primary" />
              <IonLabel>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                  Recipe feed
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
                  All community recipes
                </p>
              </IonLabel>
            </IonItem>
            <IonItem button detail routerLink="/favorites">
              <IonIcon icon={heartOutline} slot="start" color="danger" />
              <IonLabel>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                  Favorites
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
                  Recipes you’ve saved
                </p>
              </IonLabel>
            </IonItem>
            <IonItem button detail routerLink="/activity">
              <IonIcon
                icon={notificationsOutline}
                slot="start"
                color="tertiary"
              />
              <IonLabel>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                  Activity
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
                  Likes and notifications
                </p>
              </IonLabel>
            </IonItem>
          </IonList>
        </div>

        <p className="profile-section-label" style={{ marginTop: 20 }}>
          Account
        </p>
        <IonList lines="none">
          <IonItem
            button
            detail={false}
            onClick={handleLogout}
            style={{ "--border-radius": "12px" }}
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
