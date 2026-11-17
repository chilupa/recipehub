import React, { useMemo, useState } from "react";
import {
  IonCheckbox,
  IonContent,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
} from "@ionic/react";

import AppHeader from "../../../components/AppHeader";
import NoData from "../../../components/NoData";
import {
  AppButton,
  AppConfirm,
  AppInput,
  TextHeading,
} from "../../../design-system";
import { useShoppingList } from "../../../contexts/ShoppingListContext";
import type { ShoppingLine } from "../../../contexts/ShoppingListContext";
import { emptyShoppingList } from "../../../lib/emptyStateMessages";

import "./ShoppingList.css";

type Group = { key: string; title: string; lines: ShoppingLine[] };

function groupTitleForLine(line: ShoppingLine): string {
  if (line.recipeId === "__custom") return "Your items";
  return line.recipeTitle;
}

function groupLines(items: ShoppingLine[]): Group[] {
  const order: string[] = [];
  const map = new Map<string, Group>();
  for (const line of items) {
    const title = groupTitleForLine(line);
    const key = `${line.recipeId}\u0000${title}`;
    let g = map.get(key);
    if (!g) {
      g = { key, title, lines: [] };
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
    <IonPage className="shopping-list-page">
      <AppHeader
        title="Shopping list"
        showBackButton
        backHref="/profile"
        endActions={
          !isEmpty ? (
            <AppButton
              variant="text"
              color="light"
              className="shopping-list-clear-all"
              onClick={() => setClearAllOpen(true)}
            >
              Clear all
            </AppButton>
          ) : null
        }
      />
      <IonContent fullscreen className="shopping-list-content">
        <div className="shopping-list-body">
          <form className="shopping-list-add-row" onSubmit={submitCustom}>
            <AppInput
              className="shopping-list-add-input"
              label="Add item"
              hideLabel
              placeholder="Add something else…"
              name="shopping-custom"
              value={customText}
              enterkeyhint="done"
              onIonInput={(e) => setCustomText(e.detail.value ?? "")}
            />
            <AppButton
              type="submit"
              variant="primary"
              disabled={!customText.trim()}
              className="shopping-list-add-btn"
            >
              Add
            </AppButton>
          </form>

          {isEmpty ? (
            <div className="shopping-list-empty">
              <NoData {...emptyShoppingList} />
            </div>
          ) : (
            <>
              <div className="shopping-list-groups">
                {groups.map((g) => (
                  <section key={g.key} className="shopping-list-group">
                    <TextHeading level={2} className="section-label">
                      {g.title}
                    </TextHeading>
                    <IonList lines="none" className="shopping-list-group__list">
                      {g.lines.map((line) => (
                        <IonItemSliding key={line.id}>
                          <IonItem className="shopping-list-line" lines="none">
                            <IonCheckbox
                              slot="start"
                              checked={line.checked}
                              onIonChange={() => toggleLine(line.id)}
                            />
                            <IonLabel>
                              <span
                                className={
                                  line.checked
                                    ? "shopping-line__text shopping-line__text--done"
                                    : "shopping-line__text"
                                }
                              >
                                {line.text}
                              </span>
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
                  </section>
                ))}
              </div>

              {hasChecked ? (
                <div className="shopping-list-footer">
                  <AppButton
                    variant="outline"
                    color="medium"
                    fullWidth
                    onClick={() => clearChecked()}
                  >
                    Clear checked
                  </AppButton>
                </div>
              ) : null}
            </>
          )}
        </div>

        <AppConfirm
          isOpen={clearAllOpen}
          onDidDismiss={() => setClearAllOpen(false)}
          title="Clear shopping list?"
          message="This removes every item, including things you typed in."
          cancelText="Cancel"
          confirmText="Clear all"
          destructive
          onCancel={() => setClearAllOpen(false)}
          onConfirm={() => {
            clearAll();
            setClearAllOpen(false);
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default ShoppingList;
