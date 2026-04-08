import React from "react";
import {
  IonPopover,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import { create, trash } from "ionicons/icons";
import type { Recipe } from "../types/Recipe";
import { truncateRecipeTitleForDisplay } from "../lib/recipeUi";
import type { RecipeMenuPopoverState } from "../lib/recipeListOwnerState";

type Props = {
  state: RecipeMenuPopoverState;
  recipes: Recipe[];
  onDismiss: () => void;
  onRequestDelete: (recipeId: string, displayName: string) => void;
};

const RecipeOwnerMenuPopover: React.FC<Props> = ({
  state,
  recipes,
  onDismiss,
  onRequestDelete,
}) => {
  const close = () => {
    onDismiss();
  };

  return (
    <IonPopover
      isOpen={state.isOpen}
      event={state.event}
      onDidDismiss={close}
    >
      <IonList>
        <IonItem
          button
          detail={false}
          routerLink={`/recipes/edit/${state.recipeId}`}
          onClick={close}
        >
          <IonIcon icon={create} slot="start" />
          <IonLabel>Edit</IonLabel>
        </IonItem>
        <IonItem
          button
          detail={false}
          color="danger"
          onClick={() => {
            const recipe = recipes.find((r) => r.id === state.recipeId);
            onRequestDelete(
              state.recipeId,
              truncateRecipeTitleForDisplay(recipe?.title),
            );
            close();
          }}
        >
          <IonIcon icon={trash} slot="start" />
          <IonLabel>Delete</IonLabel>
        </IonItem>
      </IonList>
    </IonPopover>
  );
};

export default RecipeOwnerMenuPopover;
