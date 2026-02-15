import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Droplets,
  Sprout,
  ShieldCheck,
  ShoppingCart,
  BarChart3,
  ChevronLeft,
  Leaf,
  HelpCircle,
  Landmark,
} from "lucide-react";
import cn from "classnames";
import { useTranslation, type TranslationKey } from "../../lib/translations";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { to: "/", labelKey: "common.dashboard", icon: LayoutDashboard },
  { to: "/water", labelKey: "common.waterIrrigation", icon: Droplets },
  { to: "/crop", labelKey: "common.cropRecommendation", icon: Sprout },
  { to: "/yield", labelKey: "common.yieldPest", icon: ShieldCheck },
  { to: "/market", labelKey: "common.marketPrices", icon: ShoppingCart },
  { to: "/schemes", labelKey: "common.governmentSchemes", icon: Landmark },
  { to: "/assistance", labelKey: "common.assistance", icon: HelpCircle },
  { to: "/reports", labelKey: "common.reports", icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {mobileOpen && onMobileClose && (
        <div
          className="fixed inset-0 z-30 bg-surface-900/40 lg:hidden"
          onClick={onMobileClose}
          onKeyDown={(e) => e.key === "Escape" && onMobileClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300 ease-out",
          collapsed ? "w-[80px]" : "w-72",
          "max-lg:translate-x-0",
          !mobileOpen && "max-lg:-translate-x-full"
        )}
        style={{
          background:
            "linear-gradient(180deg, #1e2730 0%, #252e38 50%, #1e2730 100%)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* Logo Header */}
        <div
          className={cn(
            "border-b border-white/10",
            collapsed ? "px-2 py-5" : "px-4 lg:px-6 py-5"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden",
              collapsed && "justify-center"
            )}
          >
            <div
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
                boxShadow: "0 4px 12px rgba(45, 106, 79, 0.3)",
              }}
            >
              <Leaf className="h-5 w-5 lg:h-6 lg:w-6 text-white" strokeWidth={2.4} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-white font-semibold text-base lg:text-lg tracking-tight truncate">
                  Krishibodh
                </h1>
                <p className="text-slate-400 text-[11px] font-medium truncate">
                  {t("common.decisionSupport" as TranslationKey)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white shadow-lg transition-colors z-50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 lg:px-4 py-5 space-y-1.5 overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map(({ to, labelKey, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  onClick={() => onMobileClose?.()}
                  className={({ isActive }) =>
                    cn(
                      "group relative w-full",
                      !collapsed && "pr-1"
                    )
                  }
                >
                  {({ isActive }) => (
                    <div
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-300 ease-out",
                        isActive
                          ? "scale-[1.02]"
                          : "hover:scale-[1.01]"
                      )}
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #52b788 100%)",
                              boxShadow:
                                "0 8px 24px rgba(45, 106, 79, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            }
                          : { background: "transparent" }
                      }
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.04)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                          style={{
                            background:
                              "linear-gradient(180deg, #95d5b2 0%, #d8f3dc 100%)",
                            boxShadow:
                              "0 0 12px rgba(149, 213, 178, 0.6)",
                          }}
                        />
                      )}

                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-all duration-300",
                          isActive
                            ? "text-white drop-shadow-lg"
                            : "text-slate-400 group-hover:text-slate-200"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />

                      {!collapsed && (
                        <span
                          className={cn(
                            "truncate transition-all duration-300",
                            isActive
                              ? "text-white font-semibold"
                              : "text-slate-400 group-hover:text-slate-200"
                          )}
                        >
                          {t(labelKey as TranslationKey)}
                        </span>
                      )}

                      {/* Subtle shine on hover for active */}
                      {isActive && !collapsed && (
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                          }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom user profile section */}
        <div className="px-3 lg:px-4 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
            title={collapsed ? (user?.email || "Account") : undefined}
          >
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "radial-gradient(circle at 30% 0, #d8f3dc, #40916c)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35)",
              }}
            >
              <span className="text-xs font-semibold text-white">
                {(user?.email || "KB")
                  .split("@")[0]
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="text-slate-100 text-sm font-medium truncate">
                  {user?.email?.split("@")[0] || t("common.account")}
                </p>
                <p className="text-slate-400 text-[11px] truncate">
                  {user?.email || t("common.account")}
                </p>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};


