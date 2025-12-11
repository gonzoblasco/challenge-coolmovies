"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 flex flex-col items-center justify-center gap-4">
      <div className="p-6 border rounded-md bg-destructive/10 text-destructive flex flex-col items-start gap-4 max-w-md w-full">
        <h2 className="text-lg font-semibold">Something went wrong!</h2>
        <p className="text-sm text-foreground/80">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="outline"
          className="bg-background hover:bg-accent"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
