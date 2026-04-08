import React from "react";
import { IonAlert } from "@ionic/react";

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
  <IonAlert
    isOpen={isOpen}
    onDidDismiss={onDismiss}
    header="Keep going"
    message="It only takes a moment to sign in."
    buttons={[
      { text: "Cancel", role: "cancel" },
      {
        text: "Sign in",
        handler: () => {
          onSignIn();
          return true;
        },
      },
    ]}
  />
);

export default SignInPromptAlert;
