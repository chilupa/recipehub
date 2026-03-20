import React, { useState, useRef } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonText,
} from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Pagination, A11y } from "swiper/modules";
import { restaurant, heart, bookmark } from "ionicons/icons";
import "swiper/css";
import "swiper/css/pagination";

const INTRO_STORAGE_KEY = "recipehub-intro-seen";

export function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch {
    // ignore
  }
}

interface IntroProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: restaurant,
    title: "Welcome to RecipeHub",
    description:
      "Your place to save, organize, and discover recipes. Keep everything in one app.",
  },
  {
    icon: bookmark,
    title: "Save & organize",
    description:
      "Add recipes with ingredients and steps. Edit anytime and find them quickly.",
  },
  {
    icon: heart,
    title: "Favorites & more",
    description:
      "Like recipes to find them in Favorites. Swipe through and start cooking.",
  },
];

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
      (swiper && (swiper.isEnd || swiper.activeIndex >= slides.length - 1));
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
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsLastSlide(swiper.isEnd);
          }}
          modules={[Pagination, A11y]}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => {
            setIsLastSlide(swiper.isEnd);
          }}
          style={{ height: "100%", paddingBottom: 80 }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "var(--ion-color-primary)",
                    color: "var(--ion-color-primary-contrast)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                  }}
                >
                  <IonIcon icon={slide.icon} style={{ fontSize: 40 }} />
                </div>
                <IonText>
                  <h1
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "var(--ion-text-color)",
                    }}
                  >
                    {slide.title}
                  </h1>
                </IonText>
                <IonText color="medium">
                  <p
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      lineHeight: 1.5,
                      maxWidth: 320,
                    }}
                  >
                    {slide.description}
                  </p>
                </IonText>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </IonContent>
      {/* Button outside IonContent so it's not affected by scroll layer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 24px 24px",
          background:
            "linear-gradient(transparent, var(--ion-background-color) 20px)",
          zIndex: 100,
        }}
      >
        <IonButton
          type="button"
          expand="block"
          size="large"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNext();
          }}
          style={{ fontWeight: 600 }}
        >
          {isLastSlide ? "Get started" : "Next"}
        </IonButton>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleComplete();
          }}
          style={{
            display: "block",
            width: "100%",
            marginTop: 8,
            marginBottom: 24,
            padding: 8,
            background: "none",
            border: "none",
            color: "var(--ion-color-medium)",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Skip intro
        </button>
      </div>
    </IonPage>
  );
};

export default Intro;
