import React, { useState } from "react";
import { Save, MapPin, Ruler, Bell, Shield, Globe, Languages } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../lib/translations";

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage, isHindi } = useLanguage();
  const [defaultLocation, setDefaultLocation] = useState("");
  const [defaultUnit, setDefaultUnit] = useState<"metric" | "imperial">("metric");
  const [notifications, setNotifications] = useState(true);
  const [alertsEmail, setAlertsEmail] = useState(true);

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <p className="text-surface-500 text-base">
          {t("settings.accountPreferences")}
        </p>
      </div>

      <Card>
        <CardHeader
          title={isHindi ? "डिफ़ॉल्ट खेत" : "Default Farm"}
          subtitle={isHindi ? "जब कोई खेत चयनित नहीं होता तो उपयोग किया जाता है" : "Used when no farm is selected"}
        />
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700">
                {t("settings.defaultLocation")}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                  className="input-field pl-10"
                  placeholder={t("form.locationPlaceholder")}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700">
                {t("settings.defaultUnit")}
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                <select
                  value={defaultUnit}
                  onChange={(e) => setDefaultUnit(e.target.value as "metric" | "imperial")}
                  className="input-field pl-10"
                >
                  <option value="metric">{isHindi ? "मीट्रिक (हेक्टेयर, मिमी, टन/हेक्टेयर)" : "Metric (hectares, mm, t/ha)"}</option>
                  <option value="imperial">{isHindi ? "इंपीरियल (एकड़, इंच, bu/ac)" : "Imperial (acres, in, bu/ac)"}</option>
                </select>
              </div>
            </div>
            <button type="button" className="btn-primary">
              <Save className="mr-2 h-5 w-5" />
              {t("common.save")}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={t("settings.notifications")}
          subtitle={isHindi ? "अलर्ट और अनुस्मारक" : "Alerts and reminders"}
        />
        <CardContent>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-surface-200 p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-surface-500" />
                <div>
                  <p className="text-base font-medium text-surface-800">{isHindi ? "सूचनाएं सक्षम करें" : "Enable notifications"}</p>
                  <p className="text-sm text-surface-500">{isHindi ? "सक्षम होने पर इन-ऐप और पुश" : "In-app and push when enabled"}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="h-5 w-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-surface-200 p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-surface-500" />
                <div>
                  <p className="text-base font-medium text-surface-800">{t("settings.emailAlerts")}</p>
                  <p className="text-sm text-surface-500">{isHindi ? "जोखिम और सिंचाई अनुस्मारक" : "Risk and irrigation reminders"}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={alertsEmail}
                onChange={(e) => setAlertsEmail(e.target.checked)}
                className="h-5 w-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <button type="button" className="btn-primary">
              <Save className="mr-2 h-5 w-5" />
              {t("common.save")}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={t("settings.language")}
          subtitle={t("settings.platformLanguage")}
        />
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700">
                {t("settings.selectLanguage")}
              </label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
                  className="input-field pl-10"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={isHindi ? "सुरक्षा और API" : "Security and API"}
          subtitle={isHindi ? "API कुंजी और एकीकरण (प्लेसहोल्डर)" : "API keys and integration (placeholder)"}
        />
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-surface-200 p-4">
            <Shield className="h-5 w-5 text-surface-500" />
            <div>
              <p className="text-base font-medium text-surface-800">
                {isHindi ? "API एकीकरण" : "API integration"}
              </p>
              <p className="text-sm text-surface-500">
                {isHindi
                  ? "बैकएंड एडमिन से मौसम, मिट्टी और बाजार डेटा स्रोतों को कनेक्ट करें।"
                  : "Connect weather, soil, and market data sources from the backend admin."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
