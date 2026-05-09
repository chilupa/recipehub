import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
} from "react";
import { IonContent, IonPage, useIonRouter } from "@ionic/react";
import { useHistory } from "react-router-dom";

import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useShoppingList } from "../../contexts/ShoppingListContext";
import { suppressProfileShoppingTabBadge } from "../../utils/profileShoppingTabBadge";

import "./Profile.css";
import ProfileIdentitySection from "./ProfileIdentitySection";
import ProfileBrowseSection from "./ProfileBrowseSection";
import ProfileAccountSection from "./ProfileAccountSection";
import ProfilePreferencesSection from "./ProfilePreferencesSection";

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

  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<HTMLIonInputElement>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const nameHasChanges = name.trim() !== originalName.trim();

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
      showToast("Please enter your name");
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
      showToast("Profile updated");
    } catch {
      showErrorToast("Error updating profile");
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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      setDeleteAlertOpen(false);
      ionRouter.push("/login", "root", "replace");
    } catch (e) {
      showErrorToast(
        e instanceof Error
          ? e.message
          : "Could not delete account. If this keeps happening, contact support.",
      );
    } finally {
      setDeleteLoading(false);
    }
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
        <ProfileIdentitySection
          displayName={displayName}
          readOnlyNameLabel={readOnlyNameLabel}
          joinedLabel={joinedLabel}
          userEmail={user?.email}
          editingName={editingName}
          name={name}
          setName={setName}
          nameInputRef={nameInputRef}
          loading={loading}
          nameHasChanges={nameHasChanges}
          onStartEditName={() => setEditingName(true)}
          onCancelNameEdit={cancelNameEdit}
          onSaveProfile={saveProfile}
        />

        <ProfileBrowseSection
          shoppingPending={shoppingPending}
          shoppingHasList={shoppingHasList}
        />

        <ProfilePreferencesSection />

        {user ? (
          <ProfileAccountSection
            deleteAlertOpen={deleteAlertOpen}
            deleteLoading={deleteLoading}
            onDismissDeleteAlert={() => {
              if (!deleteLoading) setDeleteAlertOpen(false);
            }}
            onOpenDeleteAlert={() => setDeleteAlertOpen(true)}
            onSignOut={signOut}
            onDeleteAccount={handleDeleteAccount}
          />
        ) : null}

      </IonContent>
    </IonPage>
  );
};

export default Profile;
