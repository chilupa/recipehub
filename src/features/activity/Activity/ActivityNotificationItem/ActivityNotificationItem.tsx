import React from "react";

import { AppListItem } from "../../../../design-system";
import type { ActivityItem } from "../../../../contexts/NotificationContext";
import { formatWhen } from "../formatWhen";

import "./ActivityNotificationItem.css";

type Props = {
  item: ActivityItem;
  onOpen: (id: string, recipeId: string) => void;
};

const ActivityNotificationItem: React.FC<Props> = ({ item, onOpen }) => (
  <AppListItem
    className={
      item.read
        ? "activity-notification-item"
        : "activity-notification-item activity-notification-item--unread"
    }
    title={`${item.actorName} saved your recipe`}
    subtitle={`${item.recipeTitle} · ${formatWhen(item.createdAt)}`}
    leadingIcon="heart"
    lines="full"
    onClick={() => void onOpen(item.id, item.recipeId)}
  />
);

export default ActivityNotificationItem;
