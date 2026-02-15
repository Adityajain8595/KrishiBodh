import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Menu, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../lib/auth";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation, type TranslationKey } from "../../lib/translations";

interface TopBarProps {
  onMenuClick?: () => void;
}

const routeTitleKeys: Record<string, string> = {
  "/": "common.dashboard",
  "/water": "common.waterIrrigation",
  "/crop": "common.cropRecommendation",
  "/yield": "common.yieldPest",
  "/market": "common.marketPrices",
  "/assistance": "common.assistance",
  "/reports": "common.reports",
  "/settings": "common.settings",
};

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const titleKey = routeTitleKeys[location.pathname];
  const title = titleKey ? t(titleKey as TranslationKey) : "Krishibodh";
  const nav = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
      nav("/login", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-200 bg-white/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex lg:hidden items-center justify-center rounded-lg p-2 text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-lg sm:text-xl font-display font-semibold text-surface-900 truncate">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-2 py-1">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              language === "en"
                ? "bg-primary-600 text-white"
                : "text-surface-600 hover:bg-surface-50"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("hi")}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              language === "hi"
                ? "bg-primary-600 text-white"
                : "text-surface-600 hover:bg-surface-50"
            }`}
          >
            हिंदी
          </button>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-surface-700 hover:bg-surface-50 transition-colors"
          onClick={handleLogout}
          disabled={signingOut}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-sm font-medium">{user?.email || t("common.account")}</span>
            <span className="text-xs text-surface-500">{t("common.signOut")}</span>
          </div>
          <LogOut className="h-4 w-4 text-surface-500" />
        </button>
      </div>
    </header>
  );
};

