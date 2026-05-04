import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { FormState } from "./recipeFormModel";

export function useCoverDisplayUrl(
  formData: FormState,
  setFormData: Dispatch<SetStateAction<FormState>>,
) {
  const [objectPreview, setObjectPreview] = useState<string | null>(null);

  useEffect(() => {
    const f = formData.coverFile;
    if (!f) {
      setObjectPreview(null);
      return;
    }
    const u = URL.createObjectURL(f);
    setObjectPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [formData.coverFile]);

  const coverDisplayUrl =
    objectPreview ??
    (!formData.removeCover ? formData.existingImageUrl : null);

  const onPickCover = useCallback((file: File) => {
    setFormData((prev) => ({
      ...prev,
      coverFile: file,
      removeCover: false,
    }));
  }, [setFormData]);

  const onRemoveCover = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      coverFile: null,
      removeCover: true,
      existingImageUrl: null,
    }));
  }, [setFormData]);

  return { coverDisplayUrl, onPickCover, onRemoveCover };
}
