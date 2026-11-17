import React from "react";

import UserAvatar from "../../../components/UserAvatar";
import { AppButton, AppIcon } from "../../../design-system";

export type ProfileIdentitySectionProps = {
  displayName: string;
  avatarUrl?: string;
  userEmail?: string | null;
  joinedLabel: string | null;
  onEditProfile: () => void;
};

const ProfileIdentitySection: React.FC<ProfileIdentitySectionProps> = ({
  displayName,
  avatarUrl,
  userEmail,
  joinedLabel,
  onEditProfile,
}) => (
  <div className="profile-card">
    <div className="profile-card__main">
      <UserAvatar name={displayName} src={avatarUrl} size={40} />
      <div className="profile-card__text">
        <p className="profile-card__name text-body1 weight-semibold">
          {displayName}
        </p>
        {userEmail ? (
          <p className="profile-card__email text-caption">{userEmail}</p>
        ) : null}
        {joinedLabel ? (
          <p className="profile-card__joined text-caption">
            Joined {joinedLabel}
          </p>
        ) : null}
      </div>
      <AppButton
        variant="text"
        aria-label="Edit profile"
        className="profile-card__edit"
        onClick={onEditProfile}
      >
        <AppIcon name="createOutline" size="md" />
      </AppButton>
    </div>
  </div>
);

export default ProfileIdentitySection;
