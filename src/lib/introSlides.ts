import { restaurant, heart, pencil } from "ionicons/icons";

export type IntroSlide = {
  icon: string;
  title: string;
  description: string;
};

export const introSlides: IntroSlide[] = [
  {
    icon: restaurant,
    title: "Welcome to RecipeHub",
    description:
      "Your place to create, save, organize, and discover recipes. Keep everything in one app.",
  },
  {
    icon: pencil,
    title: "Create, save & organize",
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
