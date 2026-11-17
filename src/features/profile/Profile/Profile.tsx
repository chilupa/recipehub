import React, { useLayoutEffect, useMemo, useState } from "react";
import { IonContent, IonPage, useIonRouter } from "@ionic/react";
import { useHistory } from "react-router-dom";

import AppHeader from "../../../components/AppHeader";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useShoppingList } from "../../../contexts/ShoppingListContext";
import { suppressProfileShoppingTabBadge } from "../../../utils/profileShoppingTabBadge";

import "./Profile.css";
import ProfileIdentitySection from "./ProfileIdentitySection";
import ProfileBrowseSection from "./ProfileBrowseSection";
import ProfileAccountSection from "./ProfileAccountSection";
import ProfilePreferencesSection from "./ProfilePreferencesSection";
import EditProfileModal from "./EditProfileModal";

const Profile: React.FC = () => {
  const history = useHistory();
  const ionRouter = useIonRouter();
  const { user, updateUser, logout, deleteAccount } = useAuth();
  const { showToast, showErrorToast } = useToast();
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

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const signOut = async () => {
    await logout();
    history.replace("/login");
  };

  const handleDeleteAccount = async (password?: string) => {
    await deleteAccount(password);
    ionRouter.push("/login", "root", "replace");
  };

  const displayName =
    user?.name?.trim() || user?.email?.trim() || "Chef";
  const joinedLabel =
    user?.joinedAt != null && user.joinedAt !== ""
      ? new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
        }).format(new Date(user.joinedAt))
      : null;

  const handleSaveProfile = async (payload: {
    name: string;
    avatarFile: File | null;
  }) => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateUser({
        name: payload.name,
        avatarFile: payload.avatarFile,
      });
      window.dispatchEvent(
        new CustomEvent("profile:updated", {
          detail: {
            userId: user.id,
            displayName: payload.name,
            avatarUrl:
              updated?.avatarUrl ??
              (payload.avatarFile ? undefined : user.avatarUrl),
          },
        }),
      );
      setEditOpen(false);
      showToast("Profile updated");
    } catch {
      showErrorToast("Could not update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage className="profile-page">
      <AppHeader />
      <IonContent className="ion-padding">
        <ProfileIdentitySection
          displayName={displayName}
          avatarUrl={user?.avatarUrl}
          userEmail={user?.email}
          joinedLabel={joinedLabel}
          onEditProfile={() => setEditOpen(true)}
        />

        <ProfileBrowseSection
          shoppingPending={shoppingPending}
          shoppingHasList={shoppingHasList}
        />

        <ProfilePreferencesSection />

        {user ? (
          <ProfileAccountSection
            onSignOut={signOut}
            onDeleteAccount={handleDeleteAccount}
            onError={showErrorToast}
          />
        ) : null}
      </IonContent>

      <EditProfileModal
        isOpen={editOpen}
        onDidDismiss={() => {
          if (!saving) setEditOpen(false);
        }}
        initialName={user?.name?.trim() || ""}
        initialAvatarUrl={user?.avatarUrl}
        displayNameFallback={displayName}
        saving={saving}
        onSave={handleSaveProfile}
      />
    </IonPage>
  );
};

export default Profile;
