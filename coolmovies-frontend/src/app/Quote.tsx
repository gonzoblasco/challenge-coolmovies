"use client";

import { use } from "react";

// Simulated promise
const quotePromise = new Promise<string>((resolve) => {
  setTimeout(() => {
    resolve("React 19 is awesome!");
  }, 2000);
});

export function Quote() {
  const quote = use(quotePromise);
  return (
    <div className="p-4 bg-muted rounded-md text-center mt-4">
      <p className="italic">Quote of the day: &quot;{quote}&quot;</p>
      <p className="text-xs text-muted-foreground">(Loaded via use() hook)</p>
    </div>
  );
}
