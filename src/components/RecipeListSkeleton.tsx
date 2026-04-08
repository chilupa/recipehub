import React from "react";
import RecipeCardSkeleton from "./RecipeCardSkeleton";

const RecipeListSkeleton: React.FC = () => (
  <div style={{ paddingBottom: "80px", paddingTop: 8 }} aria-busy="true" aria-label="Loading recipes">
    <RecipeCardSkeleton />
    <RecipeCardSkeleton />
    <RecipeCardSkeleton />
  </div>
);

export default RecipeListSkeleton;
