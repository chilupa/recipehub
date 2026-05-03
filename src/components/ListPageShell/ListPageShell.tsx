import React from "react";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import "./ListPageShell.css";

type Props = {
  loading: boolean;
  isEmpty: boolean;
  loadingView: React.ReactNode;
  emptyView: React.ReactNode;
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  listClassName?: string;
};

const ListPageShell: React.FC<Props> = ({
  loading,
  isEmpty,
  loadingView,
  emptyView,
  children,
  onRefresh,
  listClassName,
}) => {
  const listClasses = ["list-page-shell__list", listClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {onRefresh ? (
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            await onRefresh();
            await (e.target as HTMLIonRefresherElement).complete();
          }}
        >
          <IonRefresherContent pullingText="Pull to refresh" />
        </IonRefresher>
      ) : null}

      {loading ? (
        <div className="list-page-shell__state list-page-shell__state--loading">
          {loadingView}
        </div>
      ) : isEmpty ? (
        <div className="list-page-shell__state list-page-shell__state--empty">
          {emptyView}
        </div>
      ) : (
        <div className={listClasses}>{children}</div>
      )}
    </>
  );
};

export default ListPageShell;
