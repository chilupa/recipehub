import React from "react";
import { IonIcon, IonText } from "@ionic/react";
import type { IntroSlide } from "../lib/introSlides";

type Props = {
  slide: IntroSlide;
};

const IntroSlidePanel: React.FC<Props> = ({ slide }) => (
  <div className="intro-slide-panel">
    <div className="intro-slide-panel__icon-wrap">
      <IonIcon icon={slide.icon} className="intro-slide-panel__icon" />
    </div>
    <IonText>
      <h1 className="intro-slide-panel__title">{slide.title}</h1>
    </IonText>
    <IonText color="medium">
      <p className="intro-slide-panel__description">{slide.description}</p>
    </IonText>
  </div>
);

export default IntroSlidePanel;
