import { AppAvatar, type AppAvatarSize } from "../../design-system";

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: number;
  /** Kept for call-site compatibility; AppAvatar uses brand tokens. */
  color?: string;
}

function mapSize(size: number): AppAvatarSize {
  if (size >= 64) return "xl";
  if (size >= 48) return "lg";
  if (size >= 32) return "md";
  if (size >= 24) return "sm";
  return "xs";
}

const UserAvatar = ({ name, src, size = 20 }: UserAvatarProps) => (
  <AppAvatar name={name} src={src} size={mapSize(size)} />
);

export default UserAvatar;
