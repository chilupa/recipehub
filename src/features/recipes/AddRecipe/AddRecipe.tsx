import React, { useRef, useState } from "react";
import { IonContent, IonPage, useIonViewDidEnter } from "@ionic/react";
import { useHistory } from "react-router-dom";

import { AppButton, AppHeader } from "../../../design-system";
import { useAuth } from "../../../contexts/AuthContext";
import { useRecipes } from "../../../contexts/RecipeContext";
import RecipeForm, {
  type RecipeFormHandle,
  type RecipeSubmitPayload,
} from "../../../components/RecipeForm";

const AddRecipe: React.FC = () => {
  const { addRecipe } = useRecipes();
  const { user, isGuest } = useAuth();
  const history = useHistory();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const formRef = useRef<RecipeFormHandle>(null);
  const [submitRequestKey, setSubmitRequestKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useIonViewDidEnter(() => {
    void contentRef.current?.scrollToTop(0);
  });

  const draftScope = user?.id ?? (isGuest ? "guest" : "__signed_out__");

  const handleSubmit = async (data: RecipeSubmitPayload) => {
    setSaving(true);
    try {
      await addRecipe(data);
      history.push("/recipes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <AppHeader
        title="Add recipe"
        showBack
        backHref="/recipes"
        endActions={
          <AppButton
            variant="text"
            color="light"
            loading={saving}
            disabled={saving}
            aria-label={saving ? "Saving recipe" : "Save recipe"}
            onClick={() => {
              if (saving) return;
              setSubmitRequestKey((key) => key + 1);
            }}
          >
            Save
          </AppButton>
        }
      />
      <IonContent ref={contentRef}>
        <RecipeForm
          ref={formRef}
          draftKey={`add:${draftScope}`}
          submitRequestKey={submitRequestKey}
          onSubmit={handleSubmit}
        />
      </IonContent>
    </IonPage>
  );
};

export default AddRecipe;
