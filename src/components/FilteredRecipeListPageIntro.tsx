import React from "react";
import { IonText } from "@ionic/react";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  /** When set, shows the recipe count line under the title. */
  countLine: string | null;
};

const FilteredRecipeListPageIntro: React.FC<Props> = ({
  eyebrow,
  title,
  countLine,
}) => (
  <div
    className="ion-padding"
    style={{
      paddingTop: 20,
      paddingBottom: 4,
    }}
  >
    <IonText color="medium">
      <p
        style={{
          margin: 0,
          fontSize: "0.8125rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </p>
    </IonText>
    <h3
      style={{
        margin: "10px 0 0",
        fontWeight: 700,
        lineHeight: 1.25,
        color: "var(--ion-color-primary)",
      }}
    >
      {title}
    </h3>
    {countLine ? (
      <IonText color="medium">
        <p style={{ margin: "8px 0 0", fontSize: "0.9375rem" }}>{countLine}</p>
      </IonText>
    ) : null}
  </div>
);

export default FilteredRecipeListPageIntro;
