import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { IonToast } from "@ionic/react";

/** Shared toast visibility duration for success-style and error messages. */
export const DEFAULT_TOAST_DURATION_MS = 3000;

type ToastContextValue = {
  showToast: (message: string) => void;
  showErrorToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

type ToastModel = {
  key: number;
  isOpen: boolean;
  message: string;
  color?: "danger";
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastModel>({
    key: 0,
    isOpen: false,
    message: "",
  });

  const onDidDismiss = useCallback(() => {
    setToast((t) => ({ ...t, isOpen: false }));
  }, []);

  const showToast = useCallback((message: string) => {
    setToast((t) => ({
      key: t.key + 1,
      isOpen: true,
      message,
      color: undefined,
    }));
  }, []);

  const showErrorToast = useCallback((message: string) => {
    setToast((t) => ({
      key: t.key + 1,
      isOpen: true,
      message,
      color: "danger",
    }));
  }, []);

  const value = useMemo(
    () => ({ showToast, showErrorToast }),
    [showToast, showErrorToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <IonToast
        key={toast.key}
        isOpen={toast.isOpen}
        duration={DEFAULT_TOAST_DURATION_MS}
        message={toast.message}
        onDidDismiss={onDidDismiss}
        {...(toast.color ? { color: toast.color } : {})}
      />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
