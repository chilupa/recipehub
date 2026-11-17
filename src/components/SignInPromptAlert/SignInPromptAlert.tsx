import React from "react";

import { AppConfirm } from "../../design-system";

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  onSignIn: () => void;
};

const SignInPromptAlert: React.FC<Props> = ({
  isOpen,
  onDismiss,
  onSignIn,
}) => (
  <AppConfirm
    isOpen={isOpen}
    onDidDismiss={onDismiss}
    title="Keep going"
    message="It only takes a moment to sign in."
    cancelText="Cancel"
    confirmText="Sign in"
    onCancel={onDismiss}
    onConfirm={() => {
      onSignIn();
      onDismiss();
    }}
  />
);

export default SignInPromptAlert;
