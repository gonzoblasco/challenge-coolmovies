"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center">
        <div className="p-6 border rounded-md bg-destructive/10 text-destructive flex flex-col items-start gap-4">
          <h2 className="text-lg font-semibold">Something went wrong!</h2>
          <p className="text-sm">
            {error.message || "An unexpected error occurred."}
          </p>
          <Button onClick={() => reset()} variant="outline">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
