import React, { useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { menu, person, settings, logOut } from "ionicons/icons";
import { useAuth } from "../hooks/useAuth";
import { useHistory } from "react-router-dom";

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
  showMenu?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = "RecipeHub",
  showBackButton = false,
  backHref = "/recipes",
  showMenu = true,
}) => {
  const { logout, user } = useAuth();
  const history = useHistory();
  const [menuOpen, setMenuOpen] = useState<{
    isOpen: boolean;
    event: Event | undefined;
  }>({ isOpen: false, event: undefined });

  const handleLogout = () => {
    setMenuOpen({ isOpen: false, event: undefined });
    logout();
    history.push("/");
  };
  return (
    <IonHeader>
      <IonToolbar color="primary">
        {showBackButton && (
          <IonButtons slot="start">
            <IonBackButton defaultHref={backHref} />
          </IonButtons>
        )}
        <IonTitle>{title}</IonTitle>
        {/* {showMenu && user && (
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              id="menu-trigger"
              onClick={(e) =>
                setMenuOpen({ isOpen: true, event: e.nativeEvent })
              }
            >
              <IonIcon icon={menu} />
            </IonButton>
          </IonButtons>
        )} */}
      </IonToolbar>

      <IonPopover
        isOpen={menuOpen.isOpen}
        event={menuOpen.event}
        onDidDismiss={() => setMenuOpen({ isOpen: false, event: undefined })}
      >
        <IonList>
          <IonItem
            button
            detail={false}
            routerLink="/profile"
            onClick={() => setMenuOpen({ isOpen: false, event: undefined })}
          >
            <IonIcon icon={person} slot="start" />
            <IonLabel>Profile</IonLabel>
          </IonItem>
          <IonItem
            button
            detail={false}
            color="danger"
            onClick={handleLogout}
          >
            <IonIcon icon={logOut} slot="start" />
            <IonLabel>Sign Out</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>
    </IonHeader>
  );
};

export default AppHeader;
