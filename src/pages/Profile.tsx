import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import {
  IonAlert,
  IonBadge,
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
  useIonRouter,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  bookOutline,
  cartOutline,
  heartOutline,
  logOutOutline,
  notificationsOutline,
  createOutline,
  trashOutline,
  listCircleOutline,
} from "ionicons/icons";

import AppHeader from "../components/AppHeader";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../contexts/AuthContext";
import { useShoppingList } from "../contexts/ShoppingListContext";
import { suppressProfileShoppingTabBadge } from "../utils/profileShoppingTabBadge";
import "./Profile.css";

const Profile: React.FC = () => {
  const history = useHistory();
  const ionRouter = useIonRouter();
  const { user, updateUser, logout, deleteAccount } = useAuth();
  const { items: shoppingItems } = useShoppingList();
  const { shoppingPending, shoppingHasList } = useMemo(() => {
    const pending = shoppingItems.filter((l) => !l.checked).length;
    return {
      shoppingPending: pending,
      shoppingHasList: shoppingItems.length > 0,
    };
  }, [shoppingItems]);

  useLayoutEffect(() => {
    suppressProfileShoppingTabBadge();
  }, []);

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
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const hasChanges = () => {
    return name.trim() !== originalName.trim();
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

  const signOut = async () => {
    await logout();
    history.push("/login");
  };

  const displayName = name || user?.name || user?.email || "User";

  const readOnlyNameLabel =
    originalName.trim() || user?.name?.trim() || user?.email || "Add your name";

  const joinedLabel =
    user?.joinedAt != null && user.joinedAt !== ""
      ? new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
        }).format(new Date(user.joinedAt))
      : null;

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
                <span className="profile-name-display">
                  {readOnlyNameLabel}
                </span>
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
          {joinedLabel != null ? (
            <div style={{ marginTop: 12, width: "100%" }}>
              <span className="profile-name-caption">Joined</span>
              <IonText
                color="medium"
                style={{ display: "block", fontSize: 14, marginTop: 4 }}
              >
                {joinedLabel}
              </IonText>
            </div>
          ) : null}
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
            <IonItem button detail routerLink="/myrecipes">
              <IonIcon
                icon={listCircleOutline}
                slot="start"
                color="secondary"
              />
              <IonLabel>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                  My recipes
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
                  Recipes you created
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
                  Favorites and notifications
                </p>
              </IonLabel>
            </IonItem>
            <IonItem button detail routerLink="/recipes/shopping">
              <IonIcon icon={cartOutline} slot="start" color="primary" />
              <IonLabel>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                  Shopping list
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
                  {shoppingPending > 0
                    ? `${shoppingPending} to buy · Check off at the store`
                    : "Check off ingredients at the store"}
                </p>
              </IonLabel>
              {shoppingPending > 0 ? (
                <IonBadge slot="end" color="primary">
                  {shoppingPending > 99 ? "99+" : shoppingPending}
                </IonBadge>
              ) : shoppingHasList ? (
                <span
                  slot="end"
                  className="profile-shopping-list-dot"
                  title="Shopping list"
                  aria-hidden
                />
              ) : null}
            </IonItem>
          </IonList>
        </div>

        {user ? (
          <>
            <p className="profile-section-label">Account</p>
            <IonList lines="none">
              <IonItem
                button
                detail={false}
                onClick={() => {
                  void signOut();
                }}
              >
                <IonIcon icon={logOutOutline} slot="start" color="primary" />
                <IonLabel>Sign out</IonLabel>
              </IonItem>
              <IonItem
                button
                detail={false}
                disabled={deleteLoading}
                onClick={() => setDeleteAlertOpen(true)}
              >
                <IonIcon icon={trashOutline} slot="start" color="danger" />
                <IonLabel color="danger">Delete account</IonLabel>
              </IonItem>
            </IonList>

            <IonAlert
              isOpen={deleteAlertOpen}
              onDidDismiss={() => {
                if (!deleteLoading) setDeleteAlertOpen(false);
              }}
              header="Delete your account?"
              message="We'll delete your account and everything tied to it (your recipes, favorites, and activity). You can't undo this."
              buttons={[
                {
                  text: "Cancel",
                  role: "cancel",
                  handler: () => setDeleteAlertOpen(false),
                },
                {
                  text: deleteLoading ? "Deleting…" : "Delete my account",
                  role: "destructive",
                  handler: () => {
                    void (async () => {
                      setDeleteLoading(true);
                      try {
                        await deleteAccount();
                        setDeleteAlertOpen(false);
                        ionRouter.push("/login", "root", "replace");
                      } catch (e) {
                        setShowToast({
                          show: true,
                          message:
                            e instanceof Error
                              ? e.message
                              : "Could not delete account. If this keeps happening, contact support.",
                          color: "danger",
                        });
                      } finally {
                        setDeleteLoading(false);
                      }
                    })();
                    return false;
                  },
                },
              ]}
            />
          </>
        ) : null}

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
