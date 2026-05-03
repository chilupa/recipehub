import { useState, useRef, useCallback } from "react";
import type { Swiper as SwiperType } from "swiper";
import { setIntroSeen } from "../../lib/introStorage";
import { introSlides } from "../../lib/introSlides";

export function useIntroPager(onComplete: () => void) {
  const [isLastSlide, setIsLastSlide] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleComplete = useCallback(() => {
    setIntroSeen();
    onComplete();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    const swiper = swiperRef.current;
    const onLastSlide =
      isLastSlide ||
      (swiper && (swiper.isEnd || swiper.activeIndex >= introSlides.length - 1));
    if (onLastSlide) {
      handleComplete();
    } else {
      swiper?.slideNext();
    }
  }, [isLastSlide, handleComplete]);

  const onSwiper = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    setIsLastSlide(swiper.isEnd);
  }, []);

  const onSlideChange = useCallback((swiper: SwiperType) => {
    setIsLastSlide(swiper.isEnd);
  }, []);

  return {
    isLastSlide,
    handleComplete,
    handleNext,
    onSwiper,
    onSlideChange,
  };
}
