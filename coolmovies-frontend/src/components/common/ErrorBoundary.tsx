"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "../ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `Uncaught error in ErrorBoundary (${this.props.name}):`,
      error,
      errorInfo
    );
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 border rounded-md bg-destructive/10 text-destructive flex flex-col items-start gap-4">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <Button
            variant="outline"
            onClick={this.handleReset}
            className="bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
