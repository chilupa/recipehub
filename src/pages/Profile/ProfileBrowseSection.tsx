import React from "react";
import {
  IonBadge,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";
import {
  bookOutline,
  cartOutline,
  heartOutline,
  listCircleOutline,
  notificationsOutline,
} from "ionicons/icons";

export type ProfileBrowseSectionProps = {
  shoppingPending: number;
  shoppingHasList: boolean;
};

const ProfileBrowseSection: React.FC<ProfileBrowseSectionProps> = ({
  shoppingPending,
  shoppingHasList,
}) => (
  <>
    <p className="profile-section-label">Browse</p>
    <div className="profile-links">
      <IonList lines="none">
        <IonItem button detail routerLink="/recipes/shopping">
          <IonIcon icon={cartOutline} slot="start" color="primary" />
          <IonLabel>
            <h2>Shopping list</h2>
            <p>
              {shoppingPending > 0
                ? `${shoppingPending} to buy · Check off at the store`
                : "Check off ingredients at the store"}
            </p>
          </IonLabel>
          {shoppingPending > 0 ? (
            <IonBadge slot="end" color="primary">
              {shoppingPending > 99 ? "99+" : shoppingPending}
            </IonBadge>
          ) : shoppingHasList ? (
            <span
              slot="end"
              className="profile-shopping-list-dot"
              title="Shopping list"
              aria-hidden
            />
          ) : null}
        </IonItem>
        <IonItem button detail routerLink="/recipes">
          <IonIcon icon={bookOutline} slot="start" color="primary" />
          <IonLabel>
            <h2>Recipe feed</h2>
            <p>All community recipes</p>
          </IonLabel>
        </IonItem>
        <IonItem button detail routerLink="/myrecipes">
          <IonIcon
            icon={listCircleOutline}
            slot="start"
            color="secondary"
          />
          <IonLabel>
            <h2>My recipes</h2>
            <p>Recipes you created</p>
          </IonLabel>
        </IonItem>
        <IonItem button detail routerLink="/favorites">
          <IonIcon icon={heartOutline} slot="start" color="danger" />
          <IonLabel>
            <h2>Favorites</h2>
            <p>Recipes you’ve saved</p>
          </IonLabel>
        </IonItem>
        <IonItem button detail routerLink="/activity">
          <IonIcon
            icon={notificationsOutline}
            slot="start"
            color="tertiary"
          />
          <IonLabel>
            <h2>Activity</h2>
            <p>Favorites and notifications</p>
          </IonLabel>
        </IonItem>
      </IonList>
    </div>
  </>
);

export default ProfileBrowseSection;
