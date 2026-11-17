import React, { useState } from "react";
import { IonAlert } from "@ionic/react";

import {
  AppButton,
  AppConfirm,
  AppIcon,
  AppListItem,
  TextHeading,
} from "../../../design-system";
import { currentUserHasPasswordProvider } from "../../../lib/deleteFirebaseAccount";

import "./ProfileAccountSection.css";

export type ProfileAccountSectionProps = {
  onSignOut: () => Promise<void>;
  onDeleteAccount: (password?: string) => Promise<void>;
  onError: (message: string) => void;
};

function getErrorCode(error: unknown): string {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: string }).code);
  }
  return "";
}

const ProfileAccountSection: React.FC<ProfileAccountSectionProps> = ({
  onSignOut,
  onDeleteAccount,
  onError,
}) => {
  const [signingOut, setSigningOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);

  const runDelete = async (password?: string) => {
    setDeletingAccount(true);
    try {
      await onDeleteAccount(password);
      setDeleteConfirmOpen(false);
      setPasswordPromptOpen(false);
    } catch (error) {
      if (
        getErrorCode(error) === "auth/requires-recent-login" &&
        currentUserHasPasswordProvider()
      ) {
        setPasswordPromptOpen(true);
      } else {
        onError(
          error instanceof Error
            ? error.message
            : "Could not delete account. If this keeps happening, contact support.",
        );
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await onSignOut();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <section className="stack profile-account-section">
      <TextHeading level={2} className="section-label">
        Account
      </TextHeading>

      <div className="profile-delete-item">
        <AppListItem
          title="Delete account"
          subtitle={
            deletingAccount
              ? "Deleting…"
              : "Permanently remove your account and recipes"
          }
          leadingIcon="trashOutline"
          lines="none"
          detail={!deletingAccount}
          onClick={() => {
            if (!deletingAccount && !signingOut) {
              setDeleteConfirmOpen(true);
            }
          }}
        />
      </div>

      <div className="profile-account-actions">
        <AppButton
          variant="text"
          color="danger"
          loading={signingOut}
          disabled={deletingAccount}
          onClick={() => void handleSignOut()}
        >
          <AppIcon name="logOutOutline" size="md" />
          Sign out
        </AppButton>
      </div>

      <AppConfirm
        isOpen={deleteConfirmOpen}
        onDidDismiss={() => {
          if (!deletingAccount) setDeleteConfirmOpen(false);
        }}
        title="Delete your account?"
        message="We'll delete your account and everything tied to it (your recipes, favorites, and activity). You can't undo this."
        cancelText="Keep account"
        confirmText="Delete account"
        destructive
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          void runDelete();
        }}
      />

      <IonAlert
        isOpen={passwordPromptOpen}
        header="Confirm with password"
        message="Enter your password to permanently delete your account."
        inputs={[
          {
            name: "password",
            type: "password",
            placeholder: "Password",
          },
        ]}
        buttons={[
          { text: "Cancel", role: "cancel" },
          {
            text: "Delete account",
            role: "destructive",
            handler: (values: { password?: string }) => {
              const password = values.password?.trim() ?? "";
              if (!password) {
                onError("Enter your password to delete your account.");
                return false;
              }
              void runDelete(password);
              return true;
            },
          },
        ]}
        onDidDismiss={() => setPasswordPromptOpen(false)}
      />
    </section>
  );
};

export default ProfileAccountSection;
