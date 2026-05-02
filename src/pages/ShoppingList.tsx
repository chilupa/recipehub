import React, { useMemo, useState } from "react";
import {
  IonAlert,
  IonButton,
  IonCheckbox,
  IonContent,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
} from "@ionic/react";
import AppHeader from "../components/AppHeader";
import NoData from "../components/NoData";
import { useShoppingList } from "../contexts/ShoppingListContext";
import type { ShoppingLine } from "../contexts/ShoppingListContext";
import { emptyShoppingList } from "../lib/emptyStateMessages";
import "./ShoppingList.css";

type Group = { key: string; title: string; lines: ShoppingLine[] };

function groupLines(items: ShoppingLine[]): Group[] {
  const order: string[] = [];
  const map = new Map<string, Group>();
  for (const line of items) {
    const key = `${line.recipeId}\u0000${line.recipeTitle}`;
    let g = map.get(key);
    if (!g) {
      g = { key, title: line.recipeTitle, lines: [] };
      map.set(key, g);
      order.push(key);
    }
    g.lines.push(line);
  }
  return order.map((k) => map.get(k)!);
}

const ShoppingList: React.FC = () => {
  const {
    items,
    toggleLine,
    removeLine,
    clearChecked,
    clearAll,
    addCustomLine,
  } = useShoppingList();
  const [customText, setCustomText] = useState("");
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const groups = useMemo(() => groupLines(items), [items]);
  const hasChecked = items.some((l) => l.checked);
  const isEmpty = items.length === 0;

  const submitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomLine(customText);
    setCustomText("");
  };

  return (
    <IonPage>
      <AppHeader
        title="Shopping list"
        showBackButton
        backHref="/recipes"
      />
      <IonContent fullscreen className="shopping-list-content">
        {!isEmpty ? (
          <div className="shopping-list-toolbar">
            {hasChecked ? (
              <IonButton
                size="small"
                fill="outline"
                color="medium"
                onClick={() => clearChecked()}
              >
                Clear checked
              </IonButton>
            ) : null}
            <IonButton
              size="small"
              fill="clear"
              color="danger"
              onClick={() => setClearAllOpen(true)}
            >
              Clear all
            </IonButton>
          </div>
        ) : null}

        <form className="shopping-list-add-row" onSubmit={submitCustom}>
          <IonItem lines="none">
            <IonInput
              value={customText}
              placeholder="Add something else…"
              enterkeyhint="done"
              onIonInput={(e) => setCustomText(e.detail.value ?? "")}
            />
            <IonButton
              slot="end"
              type="submit"
              size="small"
              disabled={!customText.trim()}
            >
              Add
            </IonButton>
          </IonItem>
        </form>

        {isEmpty ? (
          <div className="shopping-list-empty">
            <NoData {...emptyShoppingList} />
          </div>
        ) : (
          <div className="shopping-list-groups">
            {groups.map((g) => (
              <IonList key={g.key} lines="full">
                <IonListHeader>
                  <IonLabel>{g.title}</IonLabel>
                </IonListHeader>
                {g.lines.map((line) => (
                  <IonItemSliding key={line.id}>
                    <IonItem>
                      <IonCheckbox
                        slot="start"
                        checked={line.checked}
                        onIonChange={() => toggleLine(line.id)}
                      />
                      <IonLabel
                        className={
                          line.checked ? "shopping-line--done" : undefined
                        }
                      >
                        {line.text}
                      </IonLabel>
                    </IonItem>
                    <IonItemOptions side="end">
                      <IonItemOption
                        color="danger"
                        onClick={() => removeLine(line.id)}
                      >
                        Remove
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                ))}
              </IonList>
            ))}
          </div>
        )}

        <IonAlert
          isOpen={clearAllOpen}
          onDidDismiss={() => setClearAllOpen(false)}
          header="Clear shopping list?"
          message="This removes every item, including things you typed in."
          buttons={[
            { text: "Cancel", role: "cancel" },
            {
              text: "Clear all",
              role: "destructive",
              handler: () => clearAll(),
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ShoppingList;
