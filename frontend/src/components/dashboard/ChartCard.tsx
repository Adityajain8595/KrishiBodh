import React from "react";
import { Card, CardContent } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { useTranslation } from "../../lib/translations";
import cn from "classnames";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  loading = false,
  error,
  empty = false,
  emptyMessage,
  children,
  className,
  action,
}) => {
  const { t } = useTranslation();
  const displayEmptyMessage = emptyMessage ?? t("validation.noDataAvailable");
  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-white via-green-50/20 to-white border border-green-100/60 shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <div className="px-5 py-4 border-b border-green-100/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>

      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <span className="text-red-600 text-xl">⚠</span>
            </div>
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <p className="text-xs text-slate-500 mt-1">
              {t("common.tryRefresh")}
            </p>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <span className="text-slate-400 text-xl">📊</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">{displayEmptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
