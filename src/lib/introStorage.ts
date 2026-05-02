const INTRO_STORAGE_KEY = "recipehub-intro-seen";

export function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}
