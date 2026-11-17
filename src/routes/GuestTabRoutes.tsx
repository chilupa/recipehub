import React from "react";
import { Redirect, Route } from "react-router-dom";
import {
  ForgotPassword,
  Login,
  Register,
  SignInGatePage,
} from "../features/auth";
import { SearchRecipes } from "../features/search";
import { GuestRecipesStack } from "./RecipesIonStack";

/**
 * Tab stack routes for guest users (browse + search + shopping list; gated actions).
 */
const GuestTabRoutes: React.FC = () => (
  <>
    <Route exact path="/login" component={Login} />
    <Route exact path="/register" component={Register} />
    <Route exact path="/forgot-password" component={ForgotPassword} />
    <Route path="/:tab(recipes)" component={GuestRecipesStack} />
    <Route exact path="/:tab(myrecipes)" component={SignInGatePage} />
    <Route exact path="/:tab(search)" component={SearchRecipes} />
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
