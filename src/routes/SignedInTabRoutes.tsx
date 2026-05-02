import React from "react";
import { Redirect, Route } from "react-router-dom";
import RecipeList from "../pages/RecipeList";
import AddRecipe from "../pages/AddRecipe";
import EditRecipe from "../pages/EditRecipe";
import RecipeDetail from "../pages/RecipeDetail";
import TagRecipeList from "../pages/TagRecipeList";
import ServingsRecipeList from "../pages/ServingsRecipeList";
import TotalTimeRecipeList from "../pages/TotalTimeRecipeList";
import Favorites from "../pages/Favorites";
import Profile from "../pages/Profile";
import Activity from "../pages/Activity";
import MyRecipes from "../pages/MyRecipes";
import SearchRecipes from "../pages/SearchRecipes";
import ShoppingList from "../pages/ShoppingList";

/**
 * Tab stack routes for signed-in users (full access).
 */
const SignedInTabRoutes: React.FC = () => (
  <>
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
    <Route exact path="/:tab(favorites)" component={Favorites} />
    <Route exact path="/:tab(activity)" component={Activity} />
    <Route exact path="/:tab(myrecipes)" component={MyRecipes} />
    <Route exact path="/:tab(search)" component={SearchRecipes} />
    <Route exact path="/:tab(profile)" component={Profile} />
    <Route exact path="/login">
      <Redirect to="/recipes" />
    </Route>
    <Route exact path="/">
      <Redirect to="/recipes" />
    </Route>
    <Route>
      <Redirect to="/recipes" />
    </Route>
  </>
);

export default SignedInTabRoutes;
