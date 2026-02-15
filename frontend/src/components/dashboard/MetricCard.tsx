import React from "react";
import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";
import cn from "classnames";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  status?: "good" | "neutral" | "risk" | "warning";
  subtitle?: string;
  className?: string;
}

// Enhanced green palette matching landing page
const STATUS_COLORS = {
  good: {
    bg: "from-green-50 via-emerald-50/50 to-green-50",
    border: "border-green-200/60",
    iconBg: "bg-gradient-to-br from-green-100 to-emerald-100",
    iconColor: "text-green-700",
    accent: "text-green-700",
    value: "text-green-900",
  },
  neutral: {
    bg: "from-slate-50 via-slate-50/50 to-slate-50",
    border: "border-slate-200/60",
    iconBg: "bg-gradient-to-br from-slate-100 to-slate-100",
    iconColor: "text-slate-600",
    accent: "text-slate-600",
    value: "text-slate-900",
  },
  warning: {
    bg: "from-amber-50 via-yellow-50/50 to-amber-50",
    border: "border-amber-200/60",
    iconBg: "bg-gradient-to-br from-amber-100 to-yellow-100",
    iconColor: "text-amber-700",
    accent: "text-amber-700",
    value: "text-amber-900",
  },
  risk: {
    bg: "from-red-50 via-rose-50/50 to-red-50",
    border: "border-red-200/60",
    iconBg: "bg-gradient-to-br from-red-100 to-rose-100",
    iconColor: "text-red-700",
    accent: "text-red-700",
    value: "text-red-900",
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  iconBg,
  iconColor,
  status = "neutral",
  subtitle,
  className,
}) => {
  const colors = STATUS_COLORS[status];
  const trendUp = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        colors.bg,
        colors.border,
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shadow-sm",
              iconBg || colors.iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor || colors.iconColor)} />
          </div>
          
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold",
                trendUp
                  ? "bg-green-100/80 text-green-700"
                  : "bg-red-100/80 text-red-700"
              )}
            >
              {trendUp ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className={cn("text-3xl font-bold tracking-tight", colors.value)}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div className="text-sm font-medium text-slate-600">{title}</div>
          {subtitle && (
            <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
          )}
          {trendLabel && (
            <div className={cn("text-xs font-medium mt-1", colors.accent)}>
              {trendLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
