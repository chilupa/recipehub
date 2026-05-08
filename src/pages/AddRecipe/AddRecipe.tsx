import React, { useRef, useState } from "react";
import {
  IonAlert,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  useIonViewDidEnter,
} from "@ionic/react";
import { useRecipes } from "../../contexts/RecipeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import RecipeForm, {
  type RecipeFormHandle,
  type RecipeSubmitPayload,
} from "../../components/RecipeForm";
const AddRecipe: React.FC = () => {
  const { addRecipe } = useRecipes();
  const { user, isGuest } = useAuth();
  const history = useHistory();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const formRef = useRef<RecipeFormHandle>(null);

  useIonViewDidEnter(() => {
    void contentRef.current?.scrollToTop(0);
  });

  const draftScope = user?.id ?? (isGuest ? "guest" : "__signed_out__");
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleSubmit = async (data: RecipeSubmitPayload) => {
    await addRecipe(data);
    history.push("/recipes");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/recipes" text="Back" />
          </IonButtons>
          <IonTitle>Add Recipe</IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              color="medium"
              onClick={() => setConfirmClearOpen(true)}
            >
              Clear all
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef}>
        <RecipeForm
          ref={formRef}
          draftKey={`add:${draftScope}`}
          onSubmit={handleSubmit}
        />
      </IonContent>
      <IonFooter>
        <IonToolbar className="recipe-form-footer-toolbar">
          <IonButton
            expand="block"
            strong
            className="ion-margin"
            onClick={() => void formRef.current?.submit()}
          >
            Save recipe
          </IonButton>
        </IonToolbar>
      </IonFooter>

      <IonAlert
        isOpen={confirmClearOpen}
        onDidDismiss={() => setConfirmClearOpen(false)}
        header="Clear all fields?"
        message="This will remove all form content and clear your saved draft."
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => setConfirmClearOpen(false),
          },
          {
            text: "Clear all",
            role: "destructive",
            handler: () => {
              formRef.current?.reset();
              setConfirmClearOpen(false);
              void contentRef.current?.scrollToTop(250);
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default AddRecipe;
