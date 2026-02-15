import React from "react";
import cn from "classnames";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
}) => (
  <div
    className={cn(
      "animate-skeleton bg-surface-200 rounded",
      variant === "circular" && "rounded-full",
      variant === "text" && "h-4",
      className
    )}
  />
);

export const SkeletonCard: React.FC = () => (
  <div className="card p-6 space-y-4">
    <Skeleton className="h-5 w-1/3" variant="rectangular" />
    <Skeleton className="h-4 w-full" variant="text" />
    <Skeleton className="h-4 w-2/3" variant="text" />
    <Skeleton className="h-24 w-full" variant="rectangular" />
  </div>
);
