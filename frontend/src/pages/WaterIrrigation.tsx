import React, { useState, useEffect } from "react";
import {
  Droplets,
  MapPin,
  Ruler,
  Sprout,
  Layers,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { irrigationApi } from "../lib/api";
import type { IrrigationPredictResponse } from "../lib/api";
import { useTranslation } from "../lib/translations";
import { useLanguage } from "../contexts/LanguageContext";

const CROP_OPTIONS = [
  "Wheat",
  "Maize",
  "Rice",
  "Cotton",
  "Soybean",
  "Sugarcane",
  "Barley",
  "Mustard",
  "Chickpea",
  "Lentil",
  "Potato",
  "Onion",
  "Tomato",
  "Groundnut",
  "Pearl Millet",
  "Pigeon Pea",
];
const GROWTH_STAGES = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Maturity"];
const SOIL_OPTIONS = ["Loam", "Clay", "Sandy", "Silt", "Clay-loam"];
const IRRIGATION_TYPES = ["Drip", "Sprinkler", "Flood", "Pivot", "Subsurface"];

export const WaterIrrigation: React.FC = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();
  const [location, setLocation] = useState("");
  const [farmSize, setFarmSize] = useState("12.5");
  const [cropType, setCropType] = useState("Wheat");
  const [growthStage, setGrowthStage] = useState("Flowering");
  const [soilType, setSoilType] = useState("Loam");
  const [irrigationType, setIrrigationType] = useState("Drip");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IrrigationPredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store result in localStorage for reports
  useEffect(() => {
    if (result) {
      localStorage.setItem("recent-irrigation", JSON.stringify({
        dailyWater: result.dailyWater,
        weeklyWater: result.weeklyWater,
        riskLevel: result.riskLevel,
        efficiencyScore: result.efficiencyScore,
        location,
        cropType,
        date: new Date().toISOString(),
      }));
    }
  }, [result, location, cropType]);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await irrigationApi.predict({
        location,
        farmSize: Number(farmSize) || 0,
        cropType,
        growthStage,
        soilType,
        irrigationType,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("validation.requestFailed"));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-surface-500 text-base">
          {t("water.subtitle")}
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={t("water.farmParameters")}
            subtitle={t("water.configureInputs")}
          />
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">
                  {t("form.location")}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field pl-10"
                    placeholder={t("form.locationPlaceholder")}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">
                  {t("form.farmSize")}
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    className="input-field pl-10"
                    placeholder={t("form.farmSizePlaceholder")}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">
                  {t("form.cropType")}
                </label>
                <div className="relative">
                  <Sprout className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="input-field pl-10"
                  >
                    {CROP_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">
                  {t("form.growthStage")}
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="input-field pl-10"
                  >
                    {GROWTH_STAGES.map((s) => (
                      <option key={s} value={s}>{t(`stage.${s.toLowerCase()}` as any) || s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">
                  {t("form.soilType")}
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="input-field pl-10"
                  >
                    {SOIL_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">
                  {t("form.irrigationType")}
                </label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="input-field pl-10"
                  >
                    {IRRIGATION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={handleOptimize}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("form.optimize")
                )}
              </button>
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
              {location.trim() ? (
                <span className="text-sm text-surface-500">
                  {isHindi ? `मौसम ${location.trim()} के लिए प्राप्त किया जाएगा` : `Weather will be fetched for ${location.trim()}`}
                </span>
              ) : (
                <span className="text-sm text-surface-500">
                  {isHindi ? "मौसम-आधारित समायोजन के लिए शहर और राज्य दर्ज करें" : "Enter city and state for weather-based adjustment"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title={t("water.efficiency")} subtitle={isHindi ? "वर्तमान अवधि" : "Current period"} />
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-display font-semibold text-primary-600">
                  {result ? `${result.efficiencyScore}%` : "–"}
                </span>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                  <TrendingDown className="h-7 w-7 text-primary-600" />
                </div>
              </div>
              <p className="mt-2 text-sm text-surface-500">
                {result
                  ? isHindi
                    ? `आत्मविश्वास: ${(result.confidence * 100).toFixed(0)}%. दैनिक पानी: ${result.dailyWater} kL, साप्ताहिक: ${result.weeklyWater} kL।`
                    : `Confidence: ${(result.confidence * 100).toFixed(0)}%. Daily water: ${result.dailyWater} kL, weekly: ${result.weeklyWater} kL.`
                  : isHindi
                  ? "दक्षता और पानी की आवश्यकता देखने के लिए अनुकूलन चलाएं।"
                  : "Run optimization to see efficiency and water need."}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader title={isHindi ? "जोखिम संकेतक" : "Risk Indicators"} />
            <CardContent className="space-y-3">
              {result ? (
                <div className={result.riskLevel === "Low" ? "flex items-center gap-3 rounded-lg bg-green-50 p-3" : result.riskLevel === "High" ? "flex items-center gap-3 rounded-lg bg-red-50 p-3" : "flex items-center gap-3 rounded-lg bg-amber-50 p-3"}>
                  {result.riskLevel === "Low" ? <CheckCircle className="h-5 w-5 shrink-0 text-green-600" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />}
                  <div>
                    <p className="text-sm font-medium text-surface-800">
                      {isHindi ? "जोखिम: " : "Risk: "}{t(`risk.${result.riskLevel.toLowerCase()}` as any) || result.riskLevel}
                    </p>
                    <p className="text-xs text-surface-600">{result.recommendations[0] ?? (isHindi ? "अधिक या कम सिंचाई का संकेत नहीं।" : "No over- or under-irrigation indicated.")}</p>
                  </div>
                </div>
              ) : (
                <p className="text-surface-500">{isHindi ? "जोखिम संकेतक देखने के लिए अनुकूलन चलाएं।" : "Run optimization to see risk indicators."}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={t("water.dailyWater")}
            subtitle={isHindi ? "फसल, मिट्टी, सिंचाई प्रकार और मौसम से" : "From crop, soil, irrigation type, and weather"}
          />
          <CardContent>
            {result ? (
              <div className="space-y-2">
                <p className="text-2xl font-display font-semibold text-surface-900">{result.dailyWater} kL/{isHindi ? "दिन" : "day"}</p>
                <p className="text-surface-500">{result.weeklyWater} kL {isHindi ? "प्रति सप्ताह" : "per week"}</p>
              </div>
            ) : (
              <p className="text-surface-500">{isHindi ? "दैनिक और साप्ताहिक पानी की आवश्यकता देखने के लिए अनुकूलन चलाएं।" : "Run optimization to see daily and weekly water requirement."}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={t("water.schedule")}
            subtitle={isHindi ? "फसल चरण और सिस्टम प्रकार से" : "From crop stage and system type"}
          />
          <CardContent>
            {result ? (
              <p className="text-surface-600">{result.irrigationSchedule}</p>
            ) : (
              <p className="text-surface-500">{isHindi ? "अनुशंसित अनुसूची देखने के लिए अनुकूलन चलाएं।" : "Run optimization to see recommended schedule."}</p>
            )}
          </CardContent>
        </Card>
      </section>

      {result && (
        <section className="grid gap-6 lg:grid-cols-2">
          {result.weather && (
            <Card>
              <CardHeader title={isHindi ? "वर्तमान मौसम" : "Current weather"} subtitle={isHindi ? "आपके स्थान के लिए मौसम API से" : "From weather API for your location"} />
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-surface-200 p-4">
                    <p className="text-sm font-medium text-surface-500">{isHindi ? "तापमान" : "Temperature"}</p>
                    <p className="mt-1 text-xl font-display font-semibold text-surface-900">{result.weather.temperatureC} C</p>
                    <p className="text-xs text-surface-500">{result.weather.city}{result.weather.state ? `, ${result.weather.state}` : ""}</p>
                  </div>
                  <div className="rounded-lg border border-surface-200 p-4">
                    <p className="text-sm font-medium text-surface-500">{isHindi ? "आर्द्रता / वर्षा" : "Humidity / Precipitation"}</p>
                    <p className="mt-1 text-xl font-display font-semibold text-surface-900">{result.weather.humidity}% / {result.weather.precipitationMm} mm</p>
                    <p className="text-xs text-surface-500">{isHindi ? "सिंचाई की आवश्यकता को समायोजित करने के लिए उपयोग किया गया" : "Used to adjust irrigation need"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader
              title={isHindi ? "लागत प्रभाव (अनुमानित)" : "Cost impact (estimated)"}
              subtitle={isHindi ? "4 रुपये/kL पानी, 6 रुपये/kWh ऊर्जा पर पानी की मात्रा से" : "From water volume at INR 4/kL water, 6 INR/kWh energy"}
            />
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-surface-200 p-4">
                  <p className="text-sm font-medium text-surface-500">{isHindi ? "पानी की लागत (मासिक)" : "Water cost (monthly)"}</p>
                  <p className="mt-1 text-xl font-display font-semibold text-surface-900">INR {Math.round(result.dailyWater * 30 * 4).toLocaleString()}</p>
                  <p className="text-xs text-surface-500">{result.dailyWater} kL/{isHindi ? "दिन" : "day"} x 30 x 4</p>
                </div>
                <div className="rounded-lg border border-surface-200 p-4">
                  <p className="text-sm font-medium text-surface-500">{isHindi ? "ऊर्जा (पंप, मासिक)" : "Energy (pump, monthly)"}</p>
                  <p className="mt-1 text-xl font-display font-semibold text-surface-900">INR {Math.round(result.dailyWater * 30 * 0.15 * 6).toLocaleString()}</p>
                  <p className="text-xs text-surface-500">0.15 kWh/kL, 6 INR/kWh</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <Card>
        <CardHeader
          title={t("water.recommendations")}
          subtitle={isHindi ? "आपके इनपुट से नियम-आधारित अनुकूलन" : "Rule-based optimization from your inputs"}
        />
        <CardContent>
          <ul className="space-y-3">
            {result && result.recommendations.length > 0
              ? result.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 rounded-lg bg-primary-50 p-3">
                    <Zap className="h-5 w-5 shrink-0 text-primary-600" />
                    <p className="text-sm font-medium text-primary-900">{rec}</p>
                  </li>
                ))
              : (
                <li className="rounded-lg bg-surface-50 p-3">
                  <p className="text-surface-500">{isHindi ? "सिफारिशें देखने के लिए अनुकूलन चलाएं।" : "Run optimization to see recommendations."}</p>
                </li>
              )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
