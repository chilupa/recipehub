import React, { useEffect, useState } from "react";

import {
  AppButton,
  AppIcon,
  AppInput,
  TextHeading,
} from "../../design-system";

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
      <TextHeading level={2} className="recipe-servings-scaler__title">
        Servings
      </TextHeading>
      <p className="recipe-servings-scaler__hint">
        Ingredients below update based on this number.
      </p>
      <div className="recipe-servings-scaler__controls">
        <AppButton
          variant="outline"
          aria-label="Decrease servings"
          disabled={scaledServings <= 1}
          onClick={() => bump(-1)}
        >
          <AppIcon name="removeOutline" size="md" />
        </AppButton>
        <AppInput
          className="recipe-servings-scaler__input"
          label="Number of servings"
          hideLabel
          type="number"
          inputMode="numeric"
          min={1}
          max={RECIPE_SERVINGS_MAX}
          value={inputText}
          onIonInput={(e) => setInputText(String(e.detail.value ?? ""))}
          onIonBlur={() => commitInput()}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitInput();
          }}
        />
        <AppButton
          variant="outline"
          aria-label="Increase servings"
          disabled={scaledServings >= RECIPE_SERVINGS_MAX}
          onClick={() => bump(1)}
        >
          <AppIcon name="addOutline" size="md" />
        </AppButton>
      </div>
    </section>
  );
};

export default RecipeServingsScaler;
