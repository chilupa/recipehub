import React from "react";
import { IonSpinner, IonText } from "@ionic/react";
import "./ListPageShell.css";

type Props = {
  message?: string;
};

const RecipeListLoadingBlock: React.FC<Props> = ({
  message = "Loading recipes…",
}) => (
  <div className="recipe-list-loading-block">
    <IonSpinner name="crescent" />
    <IonText color="medium">
      <p className="recipe-list-loading-block__hint">{message}</p>
    </IonText>
  </div>
);

export default RecipeListLoadingBlock;
