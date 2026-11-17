import React from "react";

import {
  AppBadge,
  AppListItem,
  TextHeading,
} from "../../../design-system";

export type ProfileBrowseSectionProps = {
  shoppingPending: number;
  shoppingHasList: boolean;
};

const ProfileBrowseSection: React.FC<ProfileBrowseSectionProps> = ({
  shoppingPending,
  shoppingHasList,
}) => (
  <section className="stack profile-section">
    <TextHeading level={2} className="section-label">
      Browse
    </TextHeading>
    <div className="profile-links">
      <AppListItem
        title="Shopping list"
        subtitle={
          shoppingPending > 0
            ? `${shoppingPending} to buy · Check off at the store`
            : "Check off ingredients at the store"
        }
        leadingIcon="cartOutline"
        routerLink="/recipes/shopping"
        lines="none"
        trailing={
          shoppingPending > 0 ? (
            <AppBadge>
              {shoppingPending > 99 ? "99+" : shoppingPending}
            </AppBadge>
          ) : shoppingHasList ? (
            <span
              className="profile-shopping-list-dot"
              title="Shopping list"
              aria-hidden
            />
          ) : null
        }
      />
      <AppListItem
        title="Recipe feed"
        subtitle="All community recipes"
        leadingIcon="bookOutline"
        routerLink="/recipes"
        lines="none"
      />
      <AppListItem
        title="My recipes"
        subtitle="Recipes you created"
        leadingIcon="listCircleOutline"
        routerLink="/myrecipes"
        lines="none"
      />
      <AppListItem
        title="Favorites"
        subtitle="Recipes you’ve saved"
        leadingIcon="heartOutline"
        routerLink="/favorites"
        lines="none"
      />
      <AppListItem
        title="Activity"
        subtitle="Updates on your recipes"
        leadingIcon="notificationsOutline"
        routerLink="/activity"
        lines="none"
      />
    </div>
  </section>
);

export default ProfileBrowseSection;
