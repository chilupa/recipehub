import { describe, expect, it } from "vitest";
import {
  formatScaledQuantity,
  parseLeadingQuantity,
  scaleIngredientLine,
  scaleRecipeIngredients,
} from "./scaleIngredientQuantities";

describe("parseLeadingQuantity", () => {
  it("parses integers", () => {
    expect(parseLeadingQuantity("2 cups flour")).toEqual({
      value: 2,
      rawLen: 1,
    });
  });

  it("parses fractions", () => {
    expect(parseLeadingQuantity("1/2 tsp salt")).toEqual({
      value: 0.5,
      rawLen: 3,
    });
  });

  it("parses mixed fractions", () => {
    expect(parseLeadingQuantity("1 1/2 cups milk")).toEqual({
      value: 1.5,
      rawLen: 5,
    });
  });

  it("parses unicode fraction", () => {
    expect(parseLeadingQuantity("½ tsp vanilla")).toEqual({
      value: 0.5,
      rawLen: 1,
    });
  });

  it("returns null when no leading quantity", () => {
    expect(parseLeadingQuantity("Salt to taste")).toBeNull();
    expect(parseLeadingQuantity("10-inch tortillas")).toBeNull();
  });
});

describe("scaleIngredientLine", () => {
  it("doubles a whole amount", () => {
    expect(scaleIngredientLine("2 cups flour", 2)).toBe("4 cups flour");
  });

  it("scales fractions", () => {
    expect(scaleIngredientLine("1/2 cup sugar", 2)).toBe("1 cup sugar");
  });

  it("ignores lines without quantities", () => {
    expect(scaleIngredientLine("Salt to taste", 3)).toBe("Salt to taste");
  });

  it("preserves leading whitespace", () => {
    expect(scaleIngredientLine("  2 eggs", 2)).toBe("  4 eggs");
  });

  it("factor 1 is noop", () => {
    expect(scaleIngredientLine("3 tbsp oil", 1)).toBe("3 tbsp oil");
  });
});

describe("scaleRecipeIngredients", () => {
  it("maps all lines", () => {
    expect(scaleRecipeIngredients(["1 tbsp oil", "Pinch y"], 2)).toEqual([
      "2 tbsp oil",
      "Pinch y",
    ]);
  });

  it("factor 1 returns same reference", () => {
    const arr = ["a"];
    expect(scaleRecipeIngredients(arr, 1)).toBe(arr);
  });
});

describe("formatScaledQuantity", () => {
  it("formats integers", () => {
    expect(formatScaledQuantity(3)).toBe("3");
  });

  it("uses vulgar fractions when close", () => {
    expect(formatScaledQuantity(1.5)).toBe("1½");
    expect(formatScaledQuantity(0.25)).toBe("¼");
  });
});
