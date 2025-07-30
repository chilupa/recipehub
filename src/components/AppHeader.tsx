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
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";

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
  const { signOut } = useSupabaseAuth();
  const [menuOpen, setMenuOpen] = useState<{
    isOpen: boolean;
    event: Event | undefined;
  }>({ isOpen: false, event: undefined });
  return (
    <IonHeader>
      <IonToolbar>
        {showBackButton && (
          <IonButtons slot="start">
            <IonBackButton defaultHref={backHref} />
          </IonButtons>
        )}
        <IonTitle>{title}</IonTitle>
        {showMenu && (
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
        )}
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
            onClick={() => {
              setMenuOpen({ isOpen: false, event: undefined });
            }}
          >
            <IonIcon icon={settings} slot="start" />
            <IonLabel>Settings</IonLabel>
          </IonItem>
          <IonItem
            button
            detail={false}
            color="danger"
            onClick={() => {
              setMenuOpen({ isOpen: false, event: undefined });
              signOut();
            }}
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
