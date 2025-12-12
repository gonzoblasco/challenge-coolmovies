import { Metadata } from 'next';
import { Suspense } from "react";
import { Reviews } from "@/features/reviews";

export const metadata: Metadata = {
  title: "Coolmovies Frontend - Reviews",
  description: "Browse and write reviews for your favorite movies.",
};


export default function ReviewsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Reviews />
    </Suspense>
  );
}
