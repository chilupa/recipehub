import React from "react";
import { IonToast } from "@ionic/react";

type Props = {
  isOpen: boolean;
  message: string;
  onDidDismiss: () => void;
};

const DangerToast: React.FC<Props> = ({ isOpen, message, onDidDismiss }) => (
  <IonToast
    isOpen={isOpen}
    onDidDismiss={onDidDismiss}
    message={message}
    duration={2500}
    color="danger"
  />
);

export default DangerToast;
