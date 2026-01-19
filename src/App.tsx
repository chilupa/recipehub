import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import RecipeList from './pages/RecipeList';
import AddRecipe from './pages/AddRecipe';
import EditRecipe from './pages/EditRecipe';
import RecipeDetail from './pages/RecipeDetail';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import { RecipeProvider } from './contexts/RecipeContext';

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
import Tabs from './components/Tabs';

setupIonicReact();

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <IonReactRouter>
      {!user ? (
        <IonRouterOutlet>
          <Route exact path="/login" component={Login} />
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          <Route>
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      ) : (
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/recipes" component={RecipeList} />
            <Route exact path="/favorites" component={Favorites} />
            <Route exact path="/add" component={AddRecipe} />
            <Route exact path="/edit/:id" component={EditRecipe} />
            <Route exact path="/recipe/:id" component={RecipeDetail} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/">
              <Redirect to="/recipes" />
            </Route>
          </IonRouterOutlet>

          <Tabs />
        </IonTabs>
      )}
    </IonReactRouter>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <RecipeProvider>
          <AppRoutes />
        </RecipeProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
