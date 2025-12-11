import React, { Suspense } from "react";
import Link from "next/link";
import ClientExample from "./ClientExample";
import { Quote } from "./Quote";

export default function Page() {
  return (
    <main>
      {/* Server Component Part */}
      <h1 className="text-2xl font-bold text-center mt-4">Welcome (RSC)</h1>
      <Suspense fallback={<div>Loading App...</div>}>
        <ClientExample />
        <div className="max-w-md mx-auto">
          <Suspense
            fallback={<div className="text-center p-4">Loading quote...</div>}
          >
            <Quote />
          </Suspense>
        </div>
      </Suspense>
    </main>
  );
}
