import { IonSearchbar } from "@ionic/react";
import type { KeyboardEvent, ReactElement } from "react";

import "./AppSearchBar.css";

export interface AppSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  debounce?: number;
}

export function AppSearchBar({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = "Search",
  className,
  disabled,
  debounce = 250,
}: AppSearchBarProps): ReactElement {
  return (
    <IonSearchbar
      className={["app-search-bar", className].filter(Boolean).join(" ")}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      debounce={debounce}
      enterkeyhint="search"
      inputmode="search"
      showClearButton="focus"
      onIonInput={(event) => onChange(event.detail.value ?? "")}
      onKeyDown={(event: KeyboardEvent<HTMLIonSearchbarElement>) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onSubmit?.();
        }
      }}
      onIonClear={() => {
        onChange("");
        onClear?.();
      }}
      aria-label={placeholder}
    />
  );
}
