import { isFirebaseConfigured } from "./firebase";

export function isBackendConfigured(): boolean {
  return isFirebaseConfigured();
}
