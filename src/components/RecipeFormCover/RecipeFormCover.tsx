import React, { useRef } from "react";
import { IonButton, IonIcon, IonText } from "@ionic/react";
import { imageOutline, trashOutline } from "ionicons/icons";
import "../RecipeForm/RecipeForm.css";
import "./RecipeFormCover.css";

type Props = {
  displayUrl: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
};

const RecipeFormCover: React.FC<Props> = ({ displayUrl, onPick, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="recipe-form-cover">
      <h3 className="recipe-form-section-title">Cover photo</h3>
      <IonText color="medium">
        <p className="recipe-form-hint ion-padding-horizontal">
          Optional. Shown on the feed and recipe page.
        </p>
      </IonText>

      {displayUrl ? (
        <div className="recipe-form-cover__frame recipe-form-cover__frame--filled">
          <img
            className="recipe-form-cover__img"
            src={displayUrl}
            alt=""
            decoding="async"
          />
        </div>
      ) : null}

      <input
        ref={inputRef}
        className="recipe-form-cover__input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onPick(f);
        }}
      />

      <div className="recipe-form-cover__actions">
        <IonButton
          size="small"
          fill="outline"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <IonIcon slot="start" icon={imageOutline} />
          {displayUrl ? "Replace photo" : "Choose photo"}
        </IonButton>
        {displayUrl ? (
          <IonButton
            size="small"
            fill="clear"
            color="danger"
            type="button"
            onClick={onRemove}
          >
            <IonIcon slot="start" icon={trashOutline} />
            Remove
          </IonButton>
        ) : null}
      </div>
    </div>
  );
};

export default RecipeFormCover;
