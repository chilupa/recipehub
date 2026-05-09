import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function ThrowingChild(): React.ReactElement {
  throw new Error("unit_test_boundary");
}

describe("ErrorBoundary", () => {
  it("shows fallback UI when a child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/RecipeHub hit a snag/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload app/i)).toBeInTheDocument();

    spy.mockRestore();
  });
});
