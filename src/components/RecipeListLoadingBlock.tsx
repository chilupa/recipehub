import React from "react";
import { IonSpinner, IonText } from "@ionic/react";

type Props = {
  /** Vertical offset for the block (main feed uses more top space). */
  paddingTop?: number;
};

const RecipeListLoadingBlock: React.FC<Props> = ({ paddingTop = 24 }) => (
  <div
    className="ion-padding"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop,
    }}
  >
    <IonSpinner name="crescent" />
    <IonText color="medium">
      <p style={{ marginTop: 12, textAlign: "center" }}>Loading recipes…</p>
    </IonText>
  </div>
);

export default RecipeListLoadingBlock;
