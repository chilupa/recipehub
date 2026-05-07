import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonNote,
  IonText,
} from "@ionic/react";
import { addOutline, removeOutline } from "ionicons/icons";
import "./RecipeServingsScaler.css";

/** Enough for large events; keeps scaling math predictable on devices. */
export const RECIPE_SERVINGS_MAX = 999;

type Props = {
  scaledServings: number;
  onScaledServingsChange: (value: number) => void;
};

function clampServings(n: number): number {
  return Math.min(
    RECIPE_SERVINGS_MAX,
    Math.max(1, Math.round(Number.isFinite(n) ? n : 1)),
  );
}

const RecipeServingsScaler: React.FC<Props> = ({
  scaledServings,
  onScaledServingsChange,
}) => {
  const [inputText, setInputText] = useState(() => String(scaledServings));

  useEffect(() => {
    setInputText(String(scaledServings));
  }, [scaledServings]);

  const commitInput = () => {
    const n = Number.parseInt(inputText.trim(), 10);
    if (Number.isNaN(n)) {
      setInputText(String(scaledServings));
      return;
    }
    const next = clampServings(n);
    setInputText(String(next));
    onScaledServingsChange(next);
  };

  const bump = (delta: number) => {
    const next = clampServings(scaledServings + delta);
    onScaledServingsChange(next);
  };

  return (
    <section
      className="recipe-servings-scaler"
      aria-label="Scale recipe by servings"
    >
      <IonText>
        <h2 className="recipe-servings-scaler__title">Servings</h2>
      </IonText>
      <IonNote className="recipe-servings-scaler__hint">
        Ingredients below update based on this number.
      </IonNote>
      <IonItem lines="none" className="recipe-servings-scaler__controls">
        <IonButton
          fill="outline"
          size="small"
          aria-label="Decrease servings"
          disabled={scaledServings <= 1}
          onClick={() => bump(-1)}
        >
          <IonIcon slot="icon-only" icon={removeOutline} />
        </IonButton>
        <IonInput
          className="recipe-servings-scaler__input"
          type="number"
          inputMode="numeric"
          min={1}
          max={RECIPE_SERVINGS_MAX}
          aria-label="Number of servings"
          value={inputText}
          onIonInput={(e) => setInputText(String(e.detail.value ?? ""))}
          onIonBlur={() => commitInput()}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitInput();
          }}
        />
        <IonButton
          fill="outline"
          size="small"
          aria-label="Increase servings"
          disabled={scaledServings >= RECIPE_SERVINGS_MAX}
          onClick={() => bump(1)}
        >
          <IonIcon slot="icon-only" icon={addOutline} />
        </IonButton>
      </IonItem>
    </section>
  );
};

export default RecipeServingsScaler;
