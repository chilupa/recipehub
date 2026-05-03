import React from "react";
import { Redirect, Route } from "react-router-dom";
import Favorites from "../pages/Favorites";
import Profile from "../pages/Profile";
import Activity from "../pages/Activity";
import MyRecipes from "../pages/MyRecipes";
import SearchRecipes from "../pages/SearchRecipes";
import { SignedInRecipesStack } from "./RecipesIonStack";

/**
 * Tab stack routes for signed-in users (full access).
 */
const SignedInTabRoutes: React.FC = () => (
  <>
    <Route path="/:tab(recipes)" component={SignedInRecipesStack} />
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
