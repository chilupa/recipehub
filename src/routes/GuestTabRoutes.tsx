import React from "react";
import { Redirect, Route } from "react-router-dom";
import RecipeList from "../pages/RecipeList";
import RecipeDetail from "../pages/RecipeDetail";
import Login from "../pages/Login";
import SignInGatePage from "../pages/SignInGatePage";
import SearchRecipes from "../pages/SearchRecipes";
import ShoppingList from "../pages/ShoppingList";

/**
 * Tab stack routes for guest users (browse + search + shopping list; gated actions).
 */
const GuestTabRoutes: React.FC = () => (
  <>
    <Route exact path="/login" component={Login} />
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
    <Route exact path="/:tab(myrecipes)" component={SignInGatePage} />
    <Route exact path="/:tab(search)" component={SearchRecipes} />
    <Route exact path="/:tab(recipes)/add" component={SignInGatePage} />
    <Route path="/:tab(recipes)/edit/:id" component={SignInGatePage} />
    <Route exact path="/:tab(favorites)" component={SignInGatePage} />
    <Route exact path="/:tab(activity)" component={SignInGatePage} />
    <Route exact path="/:tab(profile)" component={SignInGatePage} />
    <Route exact path="/">
      <Redirect to="/recipes" />
    </Route>
    <Route>
      <Redirect to="/recipes" />
    </Route>
  </>
);

export default GuestTabRoutes;
