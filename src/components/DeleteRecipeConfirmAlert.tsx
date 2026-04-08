import React from "react";
import { IonAlert } from "@ionic/react";
import type { DeleteRecipeAlertState } from "../lib/recipeListOwnerState";

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
  <IonAlert
    isOpen={state.isOpen}
    onDidDismiss={onDismiss}
    header="Delete Recipe"
    message={`Are you sure you want to delete "${state.recipeName || "this recipe"}"?`}
    buttons={[
      { text: "Cancel", role: "cancel" },
      {
        text: "Delete",
        role: "destructive",
        handler: async () => {
          try {
            await deleteRecipe(state.recipeId);
            await afterDelete?.();
          } catch {
            onError("Could not delete recipe.");
          } finally {
            onDismiss();
          }
        },
      },
    ]}
  />
);

export default DeleteRecipeConfirmAlert;
