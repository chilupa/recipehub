import React, { useRef } from "react";

import {
  AppButton,
  AppIcon,
  TextHeading,
} from "../../design-system";

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
      <TextHeading level={2} className="section-label">
        Cover photo
      </TextHeading>
      <p className="section-subtitle recipe-form-hint">
        Optional. Compressed before upload to keep things light.
      </p>

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
        <AppButton
          variant="outline"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <AppIcon name="imageOutline" size="sm" />
          {displayUrl ? "Replace photo" : "Choose photo"}
        </AppButton>
        {displayUrl ? (
          <AppButton
            variant="text"
            color="danger"
            type="button"
            onClick={onRemove}
          >
            <AppIcon name="trashOutline" size="sm" />
            Remove
          </AppButton>
        ) : null}
      </div>
    </div>
  );
};

export default RecipeFormCover;
