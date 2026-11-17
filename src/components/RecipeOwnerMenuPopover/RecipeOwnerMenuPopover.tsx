import React, { useMemo } from "react";
import { IonPopover } from "@ionic/react";
import { useHistory } from "react-router-dom";

import { AppIcon } from "../../design-system";
import type { Recipe } from "../../types/Recipe";
import { truncateRecipeTitleForDisplay } from "../../lib/recipeUi";
import type { RecipeMenuPopoverState } from "../../lib/recipeListOwnerState";

import "./RecipeOwnerMenuPopover.css";

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
  const history = useHistory();

  const recipeTitle = useMemo(() => {
    const recipe = recipes.find((r) => r.id === state.recipeId);
    return truncateRecipeTitleForDisplay(recipe?.title);
  }, [recipes, state.recipeId]);

  const onEdit = () => {
    if (!state.recipeId) return;
    const id = state.recipeId;
    onDismiss();
    history.push(`/recipes/edit/${id}`);
  };

  const onDelete = () => {
    if (!state.recipeId) return;
    const id = state.recipeId;
    const name = recipeTitle;
    onDismiss();
    onRequestDelete(id, name);
  };

  return (
    <IonPopover
      className="recipe-owner-popover"
      isOpen={state.isOpen}
      event={state.event}
      onDidDismiss={onDismiss}
      dismissOnSelect
      arrow={false}
      side="bottom"
      alignment="end"
      showBackdrop
    >
      <div className="recipe-owner-popover__menu" role="menu">
        <button
          type="button"
          className="recipe-owner-popover__item"
          role="menuitem"
          onClick={onEdit}
        >
          <AppIcon name="createOutline" size="sm" />
          <span className="text-body2 weight-medium">Edit</span>
        </button>
        <button
          type="button"
          className="recipe-owner-popover__item recipe-owner-popover__item--danger"
          role="menuitem"
          onClick={onDelete}
        >
          <AppIcon name="trashOutline" size="sm" />
          <span className="text-body2 weight-medium">Delete</span>
        </button>
      </div>
    </IonPopover>
  );
};

export default RecipeOwnerMenuPopover;
