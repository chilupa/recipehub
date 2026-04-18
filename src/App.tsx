import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
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
import MyRecipes from './pages/MyRecipes';
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
import Intro, { hasSeenIntro } from './pages/Intro';
import SearchRecipes from './pages/SearchRecipes';

setupIonicReact();

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
          >
          </Route>
        </IonRouterOutlet>
      ) : (
        <>
          <IonTabs>
            <IonRouterOutlet>
              {user
              ? [
                  <Route
                    key="u-recipes"
                    exact
                    path="/:tab(recipes)"
                    component={RecipeList}
                  />,
                  <Route
                    key="u-servings"
                    path="/:tab(recipes)/servings/:servings"
                    component={ServingsRecipeList}
                  />,
                  <Route
                    key="u-total-time"
                    path="/:tab(recipes)/total-time/:minutes"
                    component={TotalTimeRecipeList}
                  />,
                  <Route
                    key="u-tag"
                    path="/:tab(recipes)/tag/:tag"
                    component={TagRecipeList}
                  />,
                  <Route
                    key="u-recipe"
                    path="/:tab(recipes)/recipe/:id"
                    component={RecipeDetail}
                  />,
                  <Route
                    key="u-add"
                    exact
                    path="/:tab(recipes)/add"
                    component={AddRecipe}
                  />,
                  <Route
                    key="u-edit"
                    path="/:tab(recipes)/edit/:id"
                    component={EditRecipe}
                  />,
                  <Route
                    key="u-favorites"
                    exact
                    path="/:tab(favorites)"
                    component={Favorites}
                  />,
                  <Route
                    key="u-activity"
                    exact
                    path="/:tab(activity)"
                    component={Activity}
                  />,
                  <Route
                    key="u-myrecipes"
                    exact
                    path="/:tab(myrecipes)"
                    component={MyRecipes}
                  />,
                  <Route
                    key="u-search"
                    exact
                    path="/:tab(search)"
                    component={SearchRecipes}
                  />,
                  <Route
                    key="u-profile"
                    exact
                    path="/:tab(profile)"
                    component={Profile}
                  />,
                  <Route key="u-login-redirect" exact path="/login">
                    <Redirect to="/recipes" />
                  </Route>,
                  <Route key="u-root-redirect" exact path="/">
                    <Redirect to="/recipes" />
                  </Route>,
                  <Route key="u-fallback-redirect">
                    <Redirect to="/recipes" />
                  </Route>,
                ]
              : [
                  <Route
                    key="g-login"
                    exact
                    path="/login"
                    component={Login}
                  />,
                  <Route
                    key="g-recipes"
                    exact
                    path="/:tab(recipes)"
                    component={RecipeList}
                  />,
                  <Route
                    key="g-recipe"
                    path="/:tab(recipes)/recipe/:id"
                    component={RecipeDetail}
                  />,
                  <Route
                    key="g-servings"
                    path="/:tab(recipes)/servings/:servings"
                    component={SignInGatePage}
                  />,
                  <Route
                    key="g-total-time"
                    path="/:tab(recipes)/total-time/:minutes"
                    component={SignInGatePage}
                  />,
                  <Route
                    key="g-tag"
                    path="/:tab(recipes)/tag/:tag"
                    component={SignInGatePage}
                  />,
                  <Route
                    key="g-myrecipes"
                    exact
                    path="/:tab(myrecipes)"
                    component={SignInGatePage}
                  />,
                  <Route
                    key="g-search"
                    exact
                    path="/:tab(search)"
                    component={SearchRecipes}
                  />,
                  <Route
                    key="g-add"
                    exact
                    path="/:tab(recipes)/add"
                    component={SignInGatePage}
                  />,
                  <Route
                    key="g-edit"
                    path="/:tab(recipes)/edit/:id"
                    component={SignInGatePage}
                  />,
                  <Route
                    key="g-favorites"
                    exact
                    path="/:tab(favorites)"
                    component={SignInGatePage}
                  />,
                  <Route
                    key="g-activity"
                    exact
                    path="/:tab(activity)"
                    component={SignInGatePage}
                  />,
                  <Route
                    key="g-profile"
                    exact
                    path="/:tab(profile)"
                    component={SignInGatePage}
                  />,
                  <Route key="g-root-redirect" exact path="/">
                    <Redirect to="/recipes" />
                  </Route>,
                  <Route key="g-fallback-redirect">
                    <Redirect to="/recipes" />
                  </Route>,
                ]}
            </IonRouterOutlet>

            <Tabs />
          </IonTabs>
        </>
      )}
    </IonReactRouter>
  );
};

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

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
