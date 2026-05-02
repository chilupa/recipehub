import React, { useState, useRef } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { setIntroSeen } from "../lib/introStorage";
import { introSlides } from "../lib/introSlides";
import IntroSlidePanel from "../components/IntroSlidePanel";
import IntroPagerFooter from "../components/IntroPagerFooter";
import "./Intro.css";

export { hasSeenIntro, setIntroSeen } from "../lib/introStorage";

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [isLastSlide, setIsLastSlide] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleComplete = () => {
    setIntroSeen();
    onComplete();
  };

  const handleNext = () => {
    const swiper = swiperRef.current;
    const onLastSlide =
      isLastSlide ||
      (swiper && (swiper.isEnd || swiper.activeIndex >= introSlides.length - 1));
    if (onLastSlide) {
      handleComplete();
    } else {
      swiper?.slideNext();
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <Swiper
          className="intro-swiper"
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsLastSlide(swiper.isEnd);
          }}
          modules={[Pagination, A11y]}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => {
            setIsLastSlide(swiper.isEnd);
          }}
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
