import React from "react";
import { IonIcon, IonItem, IonLabel } from "@ionic/react";
import { heart } from "ionicons/icons";
import type { ActivityItem } from "../../../contexts/NotificationContext";
import { formatWhen } from "../formatWhen";
import "./ActivityNotificationItem.css";

type Props = {
  item: ActivityItem;
  onOpen: (id: string, recipeId: string) => void;
};

const ActivityNotificationItem: React.FC<Props> = ({ item, onOpen }) => (
  <IonItem
    button
    detail={true}
    className={
      item.read ? undefined : "activity-notification-item--unread"
    }
    onClick={() => void onOpen(item.id, item.recipeId)}
  >
    <IonIcon icon={heart} color="danger" slot="start" />
    <IonLabel>
      <h3 className="activity-notification-item__title">
        {item.actorName} saved your recipe
      </h3>
      <p className="activity-notification-item__recipe">{item.recipeTitle}</p>
      <p className="activity-notification-item__when">
        {formatWhen(item.createdAt)}
      </p>
    </IonLabel>
  </IonItem>
);

export default ActivityNotificationItem;
