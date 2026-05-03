import React from "react";
import { IonAvatar } from "@ionic/react";
import "./UserAvatar.css";

interface UserAvatarProps {
  name: string;
  size?: number;
  /** Ionic color name (e.g. primary, medium). */
  color?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 20,
  color = "primary",
}) => {
  const layoutClass = size >= 48 ? "user-avatar--profile" : "user-avatar--compact";
  const ionTint =
    color === "medium" ? "user-avatar--ion-medium" : "user-avatar--ion-primary";

  return (
    <IonAvatar className={`user-avatar ${layoutClass} ${ionTint}`}>
      <div className="user-avatar__inner">{getInitials(name)}</div>
    </IonAvatar>
  );
};

export default UserAvatar;
