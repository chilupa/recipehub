import React from "react";
import { IonAvatar } from "@ionic/react";

interface UserAvatarProps {
  name: string;
  size?: number;
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
  return (
    <IonAvatar
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: color.startsWith("#")
            ? color
            : `var(--ion-color-${color})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${size * 0.45}px`,
          fontWeight: "bold",
          color: "var(--ion-color-dark)",
        }}
      >
        {getInitials(name)}
      </div>
    </IonAvatar>
  );
};

export default UserAvatar;
