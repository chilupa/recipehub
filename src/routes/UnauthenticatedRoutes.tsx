import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import Login from "../pages/Login";

/**
 * Routes when the user is not signed in and not continuing as guest.
 */
const UnauthenticatedRoutes: React.FC = () => (
  <IonRouterOutlet>
    <Route exact path="/login" component={Login} />
    <Route exact path="/">
      <Redirect to="/login" />
    </Route>
    <Route
      render={({ location }) => {
        const requestedPath = `${location.pathname}${location.search}${location.hash}`;
        const redirect = encodeURIComponent(requestedPath);
        return <Redirect to={`/login?redirect=${redirect}`} />;
      }}
    />
  </IonRouterOutlet>
);

export default UnauthenticatedRoutes;
