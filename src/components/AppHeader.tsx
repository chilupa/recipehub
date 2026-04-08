import React, { useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { person, logOut } from "ionicons/icons";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";

interface AppHeaderProps {
  /** Omit on stack pages that only show a back control (title in content). Pass for tag search, errors, etc. */
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
  showMenu?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  backHref = "/recipes",
  showMenu: _showMenu = true,
}) => {
  const { logout } = useAuth();
  const history = useHistory();
  const [menuOpen, setMenuOpen] = useState<{
    isOpen: boolean;
    event: Event | undefined;
  }>({ isOpen: false, event: undefined });

  /** Tab roots default to RecipeHub; stack pages with back omit title unless `title` is passed. */
  const resolvedTitle =
    title !== undefined
      ? title
      : showBackButton
        ? undefined
        : "RecipeHub";

  const handleLogout = async () => {
    setMenuOpen({ isOpen: false, event: undefined });
    await logout();
    history.push("/login");
  };
  return (
    <IonHeader>
      <IonToolbar color="primary">
        {showBackButton ? (
          <IonButtons slot="start">
            <IonBackButton defaultHref={backHref} />
          </IonButtons>
        ) : null}
        {resolvedTitle != null && resolvedTitle !== "" ? (
          <IonTitle style={{ textAlign: "center" }}>{resolvedTitle}</IonTitle>
        ) : null}
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
          <IonItem button detail={false} color="danger" onClick={handleLogout}>
            <IonIcon icon={logOut} slot="start" />
            <IonLabel>Sign Out</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>
    </IonHeader>
  );
};

export default AppHeader;
