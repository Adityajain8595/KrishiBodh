import React from "react";
import cn from "classnames";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
}) => (
  <div className={cn("card", paddingMap[padding], className)}>{children}</div>
);

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className }) => (
  <div className={cn("flex items-start justify-between gap-4", className)}>
    <div>
      <h3 className="text-lg font-display font-semibold text-surface-900">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-0.5 text-sm text-surface-500">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("mt-4", className)}>{children}</div>;
