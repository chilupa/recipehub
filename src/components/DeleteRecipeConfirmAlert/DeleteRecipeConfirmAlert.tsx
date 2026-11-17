import React from "react";
import { AppConfirm } from "../../design-system";
import type { DeleteRecipeAlertState } from "../../lib/recipeListOwnerState";

type Props = {
  state: DeleteRecipeAlertState;
  onDismiss: () => void;
  deleteRecipe: (id: string) => Promise<void>;
  afterDelete?: () => void | Promise<void>;
  onError: (message: string) => void;
};

const DeleteRecipeConfirmAlert: React.FC<Props> = ({
  state,
  onDismiss,
  deleteRecipe,
  afterDelete,
  onError,
}) => (
  <AppConfirm
    isOpen={state.isOpen}
    onDidDismiss={onDismiss}
    message="Are you sure you want to delete this recipe?"
    cancelText="Cancel"
    confirmText="Delete"
    destructive
    onConfirm={() => {
      void (async () => {
        try {
          await deleteRecipe(state.recipeId);
          await afterDelete?.();
        } catch {
          onError("Could not delete recipe.");
        } finally {
          onDismiss();
        }
      })();
    }}
  />
);

export default DeleteRecipeConfirmAlert;
