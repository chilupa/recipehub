import { IonIcon, IonLabel, IonTabBar, IonTabButton } from "@ionic/react";
import { heart, home, person } from "ionicons/icons";

const Tabs = () => {
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="recipes" href="/recipes">
        <IonIcon aria-hidden="true" icon={home} />
        <IonLabel>Recipes</IonLabel>
      </IonTabButton>
      <IonTabButton tab="favorites" href="/favorites" >
        <IonIcon aria-hidden="true" icon={heart} />
        <IonLabel>Favorites</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/profile">
        <IonIcon aria-hidden="true" icon={person} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default Tabs;
