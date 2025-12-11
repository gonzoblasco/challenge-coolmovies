"use client";

import { Suspense } from "react";
import { Reviews } from "@/features/reviews";

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Reviews />
    </Suspense>
  );
}
