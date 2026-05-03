import React, { RefObject } from "react";
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonText,
} from "@ionic/react";
import { createOutline } from "ionicons/icons";

import UserAvatar from "../../components/UserAvatar";

export type ProfileIdentitySectionProps = {
  displayName: string;
  readOnlyNameLabel: string;
  joinedLabel: string | null;
  userEmail?: string | null;
  editingName: boolean;
  name: string;
  setName: (value: string) => void;
  nameInputRef: RefObject<HTMLIonInputElement | null>;
  loading: boolean;
  nameHasChanges: boolean;
  onStartEditName: () => void;
  onCancelNameEdit: () => void;
  onSaveProfile: () => void;
};

const ProfileIdentitySection: React.FC<ProfileIdentitySectionProps> = ({
  displayName,
  readOnlyNameLabel,
  joinedLabel,
  userEmail,
  editingName,
  name,
  setName,
  nameInputRef,
  loading,
  nameHasChanges,
  onStartEditName,
  onCancelNameEdit,
  onSaveProfile,
}) => (
  <div className="profile-card">
    <UserAvatar name={displayName} size={88} color="primary" />
    <div className="profile-name-block">
      <span className="profile-name-caption">Name</span>
      {editingName ? (
        <>
          <IonItem lines="none" className="profile-name-edit-item">
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
              onClick={onCancelNameEdit}
              disabled={loading}
            >
              Cancel
            </IonButton>
            <IonButton
              onClick={() => void onSaveProfile()}
              disabled={loading || !nameHasChanges || !name.trim()}
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
            className="profile-edit-name-btn"
            onClick={onStartEditName}
          >
            <IonIcon slot="icon-only" icon={createOutline} />
          </IonButton>
        </div>
      )}
    </div>
    {userEmail ? (
      <IonText color="medium" className="profile-card-email">
        {userEmail}
      </IonText>
    ) : null}
    {joinedLabel != null ? (
      <div className="profile-joined-block">
        <span className="profile-name-caption">Joined</span>
        <IonText color="medium" className="profile-joined-value">
          {joinedLabel}
        </IonText>
      </div>
    ) : null}
  </div>
);

export default ProfileIdentitySection;
