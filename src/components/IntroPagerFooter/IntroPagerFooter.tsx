import React from "react";
import { IonButton } from "@ionic/react";
import "./IntroPagerFooter.css";

type Props = {
  isLastSlide: boolean;
  onPrimaryClick: () => void;
  onSkipClick: () => void;
};

const IntroPagerFooter: React.FC<Props> = ({
  isLastSlide,
  onPrimaryClick,
  onSkipClick,
}) => (
  <div className="intro-pager-footer">
    <IonButton
      type="button"
      expand="block"
      size="large"
      className="intro-pager-footer__primary"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPrimaryClick();
      }}
    >
      {isLastSlide ? "Get started" : "Next"}
    </IonButton>
    <button
      type="button"
      className="intro-pager-footer__skip"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSkipClick();
      }}
    >
      Skip intro
    </button>
  </div>
);

export default IntroPagerFooter;
