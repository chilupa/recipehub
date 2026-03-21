import React, { useEffect, useRef, useState } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { heart, heartOutline } from "ionicons/icons";
import "./FavoriteHeartButton.css";

type Anim = "pop" | "out" | null;

export interface FavoriteHeartButtonProps {
  isLiked: boolean;
  onToggle: () => void | Promise<void>;
  /** Shown next to the heart (e.g. formatted like count) */
  children?: React.ReactNode;
  size?: "small" | "default";
  /** For use inside clickable cards */
  stopEventPropagation?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const FavoriteHeartButton: React.FC<FavoriteHeartButtonProps> = ({
  isLiked,
  onToggle,
  children,
  size = "small",
  stopEventPropagation = false,
  className = "",
  style,
}) => {
  const prevLiked = useRef(isLiked);
  const [anim, setAnim] = useState<Anim>(null);

  useEffect(() => {
    if (isLiked === prevLiked.current) return;
    const wasLiked = prevLiked.current;
    prevLiked.current = isLiked;
    if (isLiked && !wasLiked) {
      setAnim("pop");
      const t = window.setTimeout(() => setAnim(null), 400);
      return () => clearTimeout(t);
    }
    if (!isLiked && wasLiked) {
      setAnim("out");
      const t = window.setTimeout(() => setAnim(null), 240);
      return () => clearTimeout(t);
    }
  }, [isLiked]);

  const iconClass =
    anim === "pop"
      ? "favorite-heart-ion--pop"
      : anim === "out"
        ? "favorite-heart-ion--out"
        : undefined;

  return (
    <div
      className={`favorite-heart-wrap ${className}`.trim()}
      style={style}
    >
      <IonButton
        fill="clear"
        color={isLiked ? "danger" : "medium"}
        size={size}
        className={`favorite-heart-btn${isLiked ? " favorite-heart-btn--liked" : ""}`}
        onClick={(e) => {
          if (stopEventPropagation) {
            e.stopPropagation();
            e.preventDefault();
          }
          void onToggle();
        }}
      >
        <IonIcon
          icon={isLiked ? heart : heartOutline}
          slot="icon-only"
          className={iconClass}
        />
      </IonButton>
      {children != null && children !== false ? (
        <span
          className={`favorite-heart-count${isLiked ? " favorite-heart-count--liked" : ""}`}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
};

export default FavoriteHeartButton;
