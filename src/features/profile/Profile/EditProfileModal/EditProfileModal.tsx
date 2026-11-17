import React, { useEffect, useId, useRef, useState } from "react";

import UserAvatar from "../../../../components/UserAvatar";
import {
  AppButton,
  AppIcon,
  AppInput,
  AppModal,
} from "../../../../design-system";

import "./EditProfileModal.css";

export type EditProfileModalProps = {
  isOpen: boolean;
  onDidDismiss: () => void;
  initialName: string;
  initialAvatarUrl?: string;
  displayNameFallback: string;
  saving: boolean;
  onSave: (payload: {
    name: string;
    avatarFile: File | null;
  }) => Promise<void>;
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onDidDismiss,
  initialName,
  initialAvatarUrl,
  displayNameFallback,
  saving,
  onSave,
}) => {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialName);
    setAvatarFile(null);
    setPreviewUrl(null);
  }, [isOpen, initialName]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const avatarSrc = previewUrl || initialAvatarUrl;
  const trimmedName = name.trim();
  const hasChanges =
    trimmedName !== initialName.trim() || avatarFile != null;
  const canSave = Boolean(trimmedName) && hasChanges && !saving;

  const pickPhoto = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!canSave) return;
    await onSave({ name: trimmedName, avatarFile });
  };

  return (
    <AppModal
      isOpen={isOpen}
      onDidDismiss={onDidDismiss}
      size="fullscreen"
      title="Edit profile"
      closeText="Cancel"
      confirmText="Save"
      onConfirm={() => void handleSave()}
      confirmDisabled={!canSave}
      confirmLoading={saving}
      backdropDismiss={!saving}
    >
      <div className="edit-profile-modal">
        <div className="edit-profile-modal__avatar-block">
          <UserAvatar
            name={trimmedName || displayNameFallback}
            src={avatarSrc}
            size={88}
          />
          <input
            ref={fileInputRef}
            id={fileInputId}
            className="edit-profile-modal__file"
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
          <AppButton
            variant="outline"
            onClick={pickPhoto}
            disabled={saving}
            aria-label="Choose profile photo"
          >
            <AppIcon name="cameraOutline" size="sm" />
            Change photo
          </AppButton>
          <p className="edit-profile-modal__hint text-caption">
            Photos are compressed before upload to keep things light.
          </p>
        </div>

        <AppInput
          label="Display name"
          name="edit-profile-name"
          value={name}
          maxlength={80}
          autocapitalize="words"
          disabled={saving}
          onIonInput={(e) => setName(e.detail.value ?? "")}
        />
      </div>
    </AppModal>
  );
};

export default EditProfileModal;
