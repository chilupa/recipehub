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
import { home, add, heart } from 'ionicons/icons';
import RecipeList from './pages/RecipeList';
import AddRecipe from './pages/AddRecipe';
import EditRecipe from './pages/EditRecipe';
import RecipeDetail from './pages/RecipeDetail';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import SupabaseLogin from './pages/SupabaseLogin';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
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

setupIonicReact();

const App: React.FC = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <IonApp>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </div>
      </IonApp>
    );
  }

  if (!user) {
    return (
      <IonApp>
        <SupabaseLogin />
      </IonApp>
    );
  }

  return (
  <IonApp>
    <RecipeProvider>
      <IonReactRouter>
        <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/recipes">
            <RecipeList />
          </Route>
          <Route exact path="/favorites">
            <Favorites />
          </Route>
          <Route exact path="/add">
            <AddRecipe />
          </Route>
          <Route exact path="/edit/:id">
            <EditRecipe />
          </Route>
          <Route exact path="/recipe/:id">
            <RecipeDetail />
          </Route>
          <Route exact path="/profile">
            <Profile />
          </Route>
          <Route exact path="/">
            <Redirect to="/recipes" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="recipes" href="/recipes">
            <IonIcon aria-hidden="true" icon={home} />
            <IonLabel>Recipes</IonLabel>
          </IonTabButton>
          <IonTabButton tab="favorites" href="/favorites">
            <IonIcon aria-hidden="true" icon={heart} />
            <IonLabel>Favorites</IonLabel>
          </IonTabButton>
        </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </RecipeProvider>
  </IonApp>
  );
};

export default App;
