import { beforeEach, describe, expect, it } from "vitest";
import {
  getHapticsEnabled,
  setHapticsEnabled,
} from "./hapticsSettings";

describe("hapticsSettings", () => {
  beforeEach(() => {
    localStorage.removeItem("recipehub-haptics-enabled");
  });

  it("defaults to enabled when unset", () => {
    expect(getHapticsEnabled()).toBe(true);
  });

  it("reads false when stored as 0", () => {
    setHapticsEnabled(false);
    expect(getHapticsEnabled()).toBe(false);
  });

  it("reads true when stored as 1", () => {
    setHapticsEnabled(false);
    setHapticsEnabled(true);
    expect(getHapticsEnabled()).toBe(true);
  });
});
