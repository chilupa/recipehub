import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonContent,
  IonPage,
  IonSpinner,
  IonText,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import RecipeList from './pages/RecipeList';
import AddRecipe from './pages/AddRecipe';
import EditRecipe from './pages/EditRecipe';
import RecipeDetail from './pages/RecipeDetail';
import TagRecipeList from './pages/TagRecipeList';
import ServingsRecipeList from './pages/ServingsRecipeList';
import TotalTimeRecipeList from './pages/TotalTimeRecipeList';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Activity from './pages/Activity';
import { RecipeProvider } from './contexts/RecipeContext';
import { NotificationProvider } from './contexts/NotificationContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SignInGatePage from './pages/SignInGatePage';
import Tabs from './components/Tabs';
import Intro, { hasSeenIntro, shouldSkipIntroForDeepLink } from './pages/Intro';

setupIonicReact();

const ShareRecipeLanding: React.FC<{ defaultHref: string }> = ({
  defaultHref,
}) => {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const recipeId = new URLSearchParams(location.search).get("recipeId");
    if (recipeId) {
      history.replace(`/recipes/recipe/${encodeURIComponent(recipeId)}`);
      return;
    }
    history.replace(defaultHref);
  }, [defaultHref, history, location.search]);

  return null;
};

const AppRoutes: React.FC = () => {
  const { user, isGuest, isLoading } = useAuth();
  const canUseApp = Boolean(user || isGuest);

  return (
    <IonReactRouter>
      {isLoading ? (
        <IonPage>
          <IonContent fullscreen className="ion-padding">
            <IonText color="medium">
              <div style={{ display: "flex", justifyContent: "center" }}>
                <IonSpinner name="crescent" />
              </div>
              <p style={{ textAlign: "center", marginTop: 12 }}>
                Loading…
              </p>
            </IonText>
          </IonContent>
        </IonPage>
      ) : !canUseApp ? (
        <IonRouterOutlet>
          {/*
            Without Switch, the pathless Route matches /login too and stacks a second
            Redirect, producing redirect=/login?redirect=... and breaking post-login navigation.
          */}
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route
              exact
              path="/"
              render={({ location }) => {
                const requestedPath = `${location.pathname}${location.search}${location.hash}`;
                const redirect = encodeURIComponent(requestedPath);
                return <Redirect to={`/login?redirect=${redirect}`} />;
              }}
            />
            <Route
              render={({ location }) => {
                const requestedPath = `${location.pathname}${location.search}${location.hash}`;
                const redirect = encodeURIComponent(requestedPath);
                return <Redirect to={`/login?redirect=${redirect}`} />;
              }}
            />
          </Switch>
        </IonRouterOutlet>
      ) : (
        <IonTabs>
          <IonRouterOutlet>
            {user ? (
              <>
                {/*
                  IonRouterOutlet resolves the first matching route in stack order.
                  A pathless Route matches every URL — it must be last or it always wins
                  and redirects /recipes/recipe/:id to /recipes.
                */}
                <Route exact path="/:tab(recipes)" component={RecipeList} />
                <Route path="/:tab(recipes)/servings/:servings" component={ServingsRecipeList} />
                <Route path="/:tab(recipes)/total-time/:minutes" component={TotalTimeRecipeList} />
                <Route path="/:tab(recipes)/tag/:tag" component={TagRecipeList} />
                <Route exact path="/:tab(recipes)/add" component={AddRecipe} />
                <Route path="/:tab(recipes)/edit/:id" component={EditRecipe} />
                <Route exact path="/:tab(favorites)" component={Favorites} />
                <Route exact path="/:tab(activity)" component={Activity} />
                <Route exact path="/:tab(profile)" component={Profile} />
                <Route exact path="/login">
                  <Redirect to="/recipes" />
                </Route>
                <Route
                  exact
                  path="/"
                  render={() => <ShareRecipeLanding defaultHref="/recipes" />}
                />
                <Route path="/recipes/recipe/:id" component={RecipeDetail} />
                <Route path="/:tab(recipes)/recipe/:id" component={RecipeDetail} />
                <Route>
                  <Redirect to="/recipes" />
                </Route>
              </>
            ) : (
              <>
                <Route exact path="/login" component={Login} />
                <Route exact path="/:tab(recipes)" component={RecipeList} />
                <Route path="/:tab(recipes)/servings/:servings" component={SignInGatePage} />
                <Route path="/:tab(recipes)/total-time/:minutes" component={SignInGatePage} />
                <Route path="/:tab(recipes)/tag/:tag" component={SignInGatePage} />
                <Route exact path="/:tab(recipes)/add" component={SignInGatePage} />
                <Route path="/:tab(recipes)/edit/:id" component={SignInGatePage} />
                <Route exact path="/:tab(favorites)" component={SignInGatePage} />
                <Route exact path="/:tab(activity)" component={SignInGatePage} />
                <Route exact path="/:tab(profile)" component={SignInGatePage} />
                <Route
                  exact
                  path="/"
                  render={() => <ShareRecipeLanding defaultHref="/recipes" />}
                />
                <Route path="/recipes/recipe/:id" component={RecipeDetail} />
                <Route path="/:tab(recipes)/recipe/:id" component={RecipeDetail} />
                <Route>
                  <Redirect to="/recipes" />
                </Route>
              </>
            )}
          </IonRouterOutlet>

          <Tabs />
        </IonTabs>
      )}
    </IonReactRouter>
  );
};

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => {
    if (hasSeenIntro()) return false;
    // Deep links must not sit behind intro (router is not mounted until intro dismisses).
    if (shouldSkipIntroForDeepLink()) return false;
    return true;
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return (
      <IonApp key="intro">
        <Intro onComplete={handleIntroComplete} />
      </IonApp>
    );
  }

  return (
    <IonApp key="main">
      <AuthProvider>
        <RecipeProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </RecipeProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
