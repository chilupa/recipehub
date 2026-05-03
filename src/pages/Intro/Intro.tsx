import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { introSlides } from "../../lib/introSlides";
import IntroSlidePanel from "../../components/IntroSlidePanel";
import IntroPagerFooter from "../../components/IntroPagerFooter";
import { useIntroPager } from "./useIntroPager";
import "./Intro.css";

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const {
    isLastSlide,
    handleComplete,
    handleNext,
    onSwiper,
    onSlideChange,
  } = useIntroPager(onComplete);

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <Swiper
          className="intro-swiper"
          onSwiper={onSwiper}
          modules={[Pagination, A11y]}
          pagination={{ clickable: true }}
          onSlideChange={onSlideChange}
        >
          {introSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <IntroSlidePanel slide={slide} />
            </SwiperSlide>
          ))}
        </Swiper>
      </IonContent>
      <IntroPagerFooter
        isLastSlide={isLastSlide}
        onPrimaryClick={handleNext}
        onSkipClick={handleComplete}
      />
    </IonPage>
  );
};

export default Intro;
