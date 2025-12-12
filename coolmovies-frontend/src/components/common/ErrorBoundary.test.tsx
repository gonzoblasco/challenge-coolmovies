import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

describe("ErrorBoundary Component", () => {
  // Suppress console.error for this test file as we expect errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("shows error boundary on component crash", () => {
    const ThrowError = () => {
      throw new Error("Test Error");
    };

    render(
      <ErrorBoundary name="TestBoundary">
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary name="TestBoundary">
        <div>Safe Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Safe Content")).toBeInTheDocument();
  });
});
