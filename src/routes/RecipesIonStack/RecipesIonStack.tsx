import React from "react";
import { Route } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import RecipeList from "../../pages/RecipeList";
import RecipeDetail from "../../pages/RecipeDetail";
import ShoppingList from "../../pages/ShoppingList";
import SignInGatePage from "../../pages/SignInGatePage";
import AddRecipe from "../../pages/AddRecipe";
import EditRecipe from "../../pages/EditRecipe";
import TagRecipeList from "../../pages/TagRecipeList";
import ServingsRecipeList from "../../pages/ServingsRecipeList";
import TotalTimeRecipeList from "../../pages/TotalTimeRecipeList";

/**
 * Nested stack for `/recipes` so IonRouterOutlet can track push depth (enables
 * iOS-style swipe-back from recipe detail and other subpages).
 */
export const SignedInRecipesStack: React.FC = () => (
  <IonRouterOutlet>
    <Route exact path="/:tab(recipes)" component={RecipeList} />
    <Route
      path="/:tab(recipes)/servings/:servings"
      component={ServingsRecipeList}
    />
    <Route
      path="/:tab(recipes)/total-time/:minutes"
      component={TotalTimeRecipeList}
    />
    <Route path="/:tab(recipes)/tag/:tag" component={TagRecipeList} />
    <Route path="/:tab(recipes)/recipe/:id" component={RecipeDetail} />
    <Route exact path="/:tab(recipes)/add" component={AddRecipe} />
    <Route path="/:tab(recipes)/edit/:id" component={EditRecipe} />
    <Route exact path="/:tab(recipes)/shopping" component={ShoppingList} />
  </IonRouterOutlet>
);

export const GuestRecipesStack: React.FC = () => (
  <IonRouterOutlet>
    <Route exact path="/:tab(recipes)" component={RecipeList} />
    <Route path="/:tab(recipes)/recipe/:id" component={RecipeDetail} />
    <Route exact path="/:tab(recipes)/shopping" component={ShoppingList} />
    <Route
      path="/:tab(recipes)/servings/:servings"
      component={SignInGatePage}
    />
    <Route
      path="/:tab(recipes)/total-time/:minutes"
      component={SignInGatePage}
    />
    <Route path="/:tab(recipes)/tag/:tag" component={SignInGatePage} />
    <Route exact path="/:tab(recipes)/add" component={SignInGatePage} />
    <Route path="/:tab(recipes)/edit/:id" component={SignInGatePage} />
  </IonRouterOutlet>
);
