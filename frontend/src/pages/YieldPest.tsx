import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Calendar,
  Layers,
  Ruler,
  Droplets,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  FileText,
  CloudRain,
  ShoppingCart,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { yieldApi, pestApi } from "../lib/api";
import type { YieldPredictResponse, PestAnalyzeResponse } from "../lib/api";
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
const IRRIGATION_OPTIONS = ["Drip", "Subsurface", "Pivot", "Sprinkler", "Flood"];

export const YieldPest: React.FC = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();
  const [cropType, setCropType] = useState("Wheat");
  const [plantingDate, setPlantingDate] = useState("2025-11-15");
  const [growthStage, setGrowthStage] = useState("Flowering");
  const [soilType, setSoilType] = useState("Loam");
  const [irrigationMethod, setIrrigationMethod] = useState("Drip");
  const [farmSize, setFarmSize] = useState("12.5");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [yieldResult, setYieldResult] = useState<YieldPredictResponse | null>(null);
  const [pestResult, setPestResult] = useState<PestAnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store result in localStorage for reports
  useEffect(() => {
    if (yieldResult) {
      localStorage.setItem("recent-yield", JSON.stringify({
        predictedYield: yieldResult.predictedYield,
        yieldPerAcre: yieldResult.yieldPerAcre,
        riskLevel: yieldResult.riskLevel,
        cropType,
        location,
        date: new Date().toISOString(),
      }));
    }
  }, [yieldResult, cropType, location]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const yieldRes = await yieldApi.predict({
        cropType,
        variety: cropType,
        farmSize: Number(farmSize) || 0,
        growthStage,
        soilType,
        irrigationType: irrigationMethod,
        location: location.trim() || undefined,
      });
      setYieldResult(yieldRes);

      if (location.trim()) {
        const pestRes = await pestApi.analyze({ cropType, growthStage, location: location.trim() });
        setPestResult(pestRes);
      } else {
        setPestResult(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("validation.requestFailed"));
      setYieldResult(null);
      setPestResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-surface-500 text-base">
          {t("yield.subtitle")}
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={t("yield.cropFarmParameters")} subtitle={t("yield.inputsForPrediction")} />
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("form.cropType")}</label>
                <div className="relative">
                  <Sprout className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="input-field pl-10">
                    {CROP_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("form.plantingDate")}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("form.growthStage")}</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="input-field pl-10"
                  >
                    {GROWTH_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("form.soilType")}</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="input-field pl-10">
                    {SOIL_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("form.irrigationType")}</label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select
                    value={irrigationMethod}
                    onChange={(e) => setIrrigationMethod(e.target.value)}
                    className="input-field pl-10"
                  >
                    {IRRIGATION_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("form.farmSize")}</label>
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
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-surface-700">
                  {isHindi ? "स्थान (शहर, राज्य) मौसम प्रभाव और कीट जोखिम के लिए" : "Location (city, state) for weather impact and pest risk"}
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
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6">
              <button type="button" onClick={handleAnalyze} disabled={loading} className="btn-primary">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("form.analyze")
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title={t("yield.predictedYield")} subtitle={isHindi ? "टन/हेक्टेयर और कुल" : "t/ha and total"} />
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-semibold text-surface-900">
                  {yieldResult ? yieldResult.yieldPerAcre.toFixed(1) : "–"}
                </span>
                <span className="text-surface-500">t/ha</span>
              </div>
              <p className="mt-1 text-sm text-surface-500">
                {yieldResult
                  ? isHindi
                    ? `कुल: ${yieldResult.predictedYield.toFixed(1)} टन`
                    : `Total: ${yieldResult.predictedYield.toFixed(1)} t`
                  : isHindi
                  ? "पूर्वानुमानित उपज देखने के लिए विश्लेषण चलाएं।"
                  : "Run analysis to see predicted yield."}
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary-50 p-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {yieldResult
                    ? isHindi
                      ? `आत्मविश्वास: ${(yieldResult.confidence * 100).toFixed(0)}%`
                      : `Confidence: ${(yieldResult.confidence * 100).toFixed(0)}%`
                    : isHindi
                    ? "आत्मविश्वास के लिए विश्लेषण चलाएं।"
                    : "Run analysis for confidence."}
                </span>
              </div>

              {yieldResult?.weather && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-surface-200 p-2 text-sm text-surface-600">
                  <CloudRain className="h-4 w-4 shrink-0" />
                  <span>
                    Weather at {yieldResult.weather.city}: {yieldResult.weather.temperatureC} C,{" "}
                    {yieldResult.weather.precipitationMm} mm precip.
                  </span>
                </div>
              )}

              {yieldResult?.assumptions?.length ? (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-surface-600">Assumptions:</p>
                  <ul className="list-inside list-disc text-xs text-surface-500">
                    {yieldResult.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={t("yield.pestRisk")} subtitle={isHindi ? "फसल, चरण और मौसम के आधार पर" : "Based on crop, stage, and weather"} />
            <CardContent>
              {pestResult ? (
                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-3 rounded-lg p-3 ${
                      pestResult.pestRisk === "High"
                        ? "bg-red-50"
                        : pestResult.pestRisk === "Medium"
                        ? "bg-amber-50"
                        : "bg-green-50"
                    }`}
                  >
                    <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-base font-medium text-surface-800">
                        {t(`risk.${pestResult.pestRisk.toLowerCase()}` as any) || pestResult.pestRisk}
                      </p>
                      <p className="text-xs text-surface-600">
                        {isHindi ? "संभावित कीट: " : "Likely pests: "}{pestResult.likelyPests.join(", ")}.
                      </p>
                    </div>
                  </div>
                  {pestResult.weather && (
                    <div className="flex items-center gap-2 rounded-lg border border-surface-200 p-2 text-sm text-surface-600">
                      <CloudRain className="h-4 w-4 shrink-0" />
                      <span>
                        Weather at {pestResult.weather.city}: {pestResult.weather.temperatureC} C, humidity{" "}
                        {pestResult.weather.humidity}%.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-surface-500">Enter location and run analysis to see pest risk.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Large Pest Information Column */}
        <Card className="lg:col-span-1">
          <CardHeader title={isHindi ? "फसलों को प्रभावित करने वाले कीट" : "Pests Affecting Crops"} subtitle={isHindi ? "कीट जानकारी और रोकथाम" : "Pest information and prevention"} />
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* Wheat Pests */}
              <div className="rounded-lg border border-surface-200 p-4 bg-white">
                <h4 className="text-base font-semibold text-surface-900 mb-2">Wheat</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Common Pests:</p>
                    <p className="text-xs text-surface-600">Aphids, Rust, Termites, Army worm, Stem borer</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Impact:</p>
                    <p className="text-xs text-surface-600">Can reduce yield by 15-30% if not managed. Rust affects grain quality.</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-100">
                    <p className="text-xs font-medium text-amber-700">⚠️ Prevention: Monitor during vegetative stage, use resistant varieties.</p>
                  </div>
                </div>
              </div>

              {/* Rice Pests */}
              <div className="rounded-lg border border-surface-200 p-4 bg-white">
                <h4 className="text-base font-semibold text-surface-900 mb-2">Rice</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Common Pests:</p>
                    <p className="text-xs text-surface-600">Stem borer, Leafhopper, Blast, Brown spot, Sheath blight</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Impact:</p>
                    <p className="text-xs text-surface-600">Stem borer can cause 20-40% yield loss. Blast affects panicle development.</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-100">
                    <p className="text-xs font-medium text-amber-700">⚠️ Prevention: Maintain proper water levels, use IPM practices.</p>
                  </div>
                </div>
              </div>

              {/* Maize Pests */}
              <div className="rounded-lg border border-surface-200 p-4 bg-white">
                <h4 className="text-base font-semibold text-surface-900 mb-2">Maize</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Common Pests:</p>
                    <p className="text-xs text-surface-600">Fall armyworm, Stem borer, Aphids, Earworm, Leaf blight</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Impact:</p>
                    <p className="text-xs text-surface-600">Fall armyworm can cause severe damage (30-50% loss). Earworm affects kernels.</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-100">
                    <p className="text-xs font-medium text-amber-700">⚠️ Prevention: Early detection critical, use Bt varieties where available.</p>
                  </div>
                </div>
              </div>

              {/* Cotton Pests */}
              <div className="rounded-lg border border-surface-200 p-4 bg-white">
                <h4 className="text-base font-semibold text-surface-900 mb-2">Cotton</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Common Pests:</p>
                    <p className="text-xs text-surface-600">Bollworm, Aphids, Whitefly, Jassids, Leaf curl</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Impact:</p>
                    <p className="text-xs text-surface-600">Bollworm is a major threat, can reduce yield by 25-40%. Whitefly causes sooty mold.</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-100">
                    <p className="text-xs font-medium text-amber-700">⚠️ Prevention: Regular scouting, use economic thresholds, avoid overuse of pesticides.</p>
                  </div>
                </div>
              </div>

              {/* Tomato Pests */}
              <div className="rounded-lg border border-surface-200 p-4 bg-white">
                <h4 className="text-base font-semibold text-surface-900 mb-2">Tomato</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Common Pests:</p>
                    <p className="text-xs text-surface-600">Fruit borer, Whitefly, Leaf curl, Early blight, Late blight</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Impact:</p>
                    <p className="text-xs text-surface-600">Fruit borer damages 20-30% of fruits. Blight diseases can destroy entire crop.</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-100">
                    <p className="text-xs font-medium text-amber-700">⚠️ Prevention: Crop rotation, proper spacing, fungicide application during flowering.</p>
                  </div>
                </div>
              </div>

              {/* Sugarcane Pests */}
              <div className="rounded-lg border border-surface-200 p-4 bg-white">
                <h4 className="text-base font-semibold text-surface-900 mb-2">Sugarcane</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Common Pests:</p>
                    <p className="text-xs text-surface-600">Borer, Aphids, Scale, Red rot, Smut</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-700 mb-1">Impact:</p>
                    <p className="text-xs text-surface-600">Borer reduces cane weight and sugar content. Red rot affects quality significantly.</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-100">
                    <p className="text-xs font-medium text-amber-700">⚠️ Prevention: Use healthy seed sets, remove affected canes, maintain field hygiene.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Recommendations" subtitle="Actions and monitoring" />
            <CardContent>
              <ul className="space-y-3">
                {pestResult?.preventionMeasures?.length
                  ? pestResult.preventionMeasures.map((m, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-lg border border-surface-200 p-3">
                        <ShieldAlert className="h-5 w-5 shrink-0 text-primary-600" />
                        <p className="text-base font-medium text-surface-800">{m}</p>
                      </li>
                    ))
                  : yieldResult?.recommendations?.length
                  ? yieldResult.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-lg border border-surface-200 p-3">
                        <FileText className="h-5 w-5 shrink-0 text-earth-600" />
                        <p className="text-base font-medium text-surface-800">{r}</p>
                      </li>
                    ))
                  : (
                      <li className="rounded-lg border border-surface-200 p-3">
                        <p className="text-surface-500">Run analysis to see recommendations.</p>
                      </li>
                    )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Market prices" subtitle="Real mandi data" />
            <CardContent>
              <p className="text-sm text-surface-600 mb-3">
                View real agricultural market prices (min, max, modal) from government mandi data. No estimates.
              </p>
              <Link
                to="/market"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                Open Market Prices
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

