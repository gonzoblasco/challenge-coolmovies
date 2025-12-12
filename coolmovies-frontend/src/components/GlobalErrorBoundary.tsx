"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { errorService } from "../services/errorService";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorService.log({ error, errorInfo }, "GlobalErrorBoundary");
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
          <div className="max-w-md w-full p-8 border rounded-lg shadow-lg bg-card bg-opacity-50 backdrop-blur-sm text-center">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Something went wrong</h2>
            <p className="mb-6 text-muted-foreground">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 bg-muted rounded text-left overflow-auto max-h-40 text-xs font-mono">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex justify-center gap-4">
              <Button onClick={this.handleReload} variant="default">
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
