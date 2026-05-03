import React from "react";
import { IonAlert, IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { logOutOutline, trashOutline } from "ionicons/icons";

export type ProfileAccountSectionProps = {
  deleteAlertOpen: boolean;
  deleteLoading: boolean;
  onDismissDeleteAlert: () => void;
  onOpenDeleteAlert: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
};

const ProfileAccountSection: React.FC<ProfileAccountSectionProps> = ({
  deleteAlertOpen,
  deleteLoading,
  onDismissDeleteAlert,
  onOpenDeleteAlert,
  onSignOut,
  onDeleteAccount,
}) => (
  <>
    <p className="profile-section-label">Account</p>
    <IonList lines="none">
      <IonItem
        button
        detail={false}
        onClick={() => {
          void onSignOut();
        }}
      >
        <IonIcon icon={logOutOutline} slot="start" color="primary" />
        <IonLabel>Sign out</IonLabel>
      </IonItem>
      <IonItem
        button
        detail={false}
        disabled={deleteLoading}
        onClick={onOpenDeleteAlert}
      >
        <IonIcon icon={trashOutline} slot="start" color="danger" />
        <IonLabel color="danger">Delete account</IonLabel>
      </IonItem>
    </IonList>

    <IonAlert
      isOpen={deleteAlertOpen}
      onDidDismiss={onDismissDeleteAlert}
      header="Delete your account?"
      message="We'll delete your account and everything tied to it (your recipes, favorites, and activity). You can't undo this."
      buttons={[
        {
          text: "Cancel",
          role: "cancel",
          handler: () => onDismissDeleteAlert(),
        },
        {
          text: deleteLoading ? "Deleting…" : "Delete my account",
          role: "destructive",
          handler: () => {
            void onDeleteAccount();
            return false;
          },
        },
      ]}
    />
  </>
);

export default ProfileAccountSection;
