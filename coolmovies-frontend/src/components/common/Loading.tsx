import React from "react";
import { Skeleton } from "../ui/skeleton";

interface LoadingProps {
  lines?: number;
  className?: string;
}

export const Loading = ({ lines = 3, className }: LoadingProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
};
