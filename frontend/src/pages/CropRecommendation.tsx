import React, { useState, useEffect } from "react";
import { MapPin, Layers, Calendar, Ruler, CloudRain, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { cropApi } from "../lib/api";
import type { CropsRecommendResponse } from "../lib/api";
import { SeedBuying } from "../components/SeedBuying";
import { useTranslation } from "../lib/translations";
import { useLanguage } from "../contexts/LanguageContext";

const SOIL_OPTIONS = ["Loam", "Clay", "Sandy", "Silt", "Clay-loam"];
const SEASONS = ["Rabi", "Kharif", "Zaid", "Year-round"];

export const CropRecommendation: React.FC = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();
  const [location, setLocation] = useState("");
  const [soilType, setSoilType] = useState("Loam");
  const [season, setSeason] = useState("Rabi");
  const [farmSize, setFarmSize] = useState("12.5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropsRecommendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store result in localStorage for reports and sessionStorage for report generation
  useEffect(() => {
    if (result && result.recommendedCrops && result.recommendedCrops.length > 0) {
      localStorage.setItem("recent-crop", JSON.stringify({
        selectedCrop: result.recommendedCrops[0].crop,
        season,
        location,
        soilType,
        farmSize,
        date: new Date().toISOString(),
      }));
      
      // Store season in sessionStorage for report generation
      sessionStorage.setItem("selected-season", season);
      sessionStorage.setItem("selected-crop", result.recommendedCrops[0].crop);
    }
  }, [result, season, location, soilType, farmSize]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cropApi.recommend({
        location,
        soilType,
        season,
        farmSize: Number(farmSize) || 0,
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
          {t("crop.subtitle")}
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={t("crop.inputParameters")} subtitle={t("crop.locationSoilSeason")} />
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("form.location")}</label>
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
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("form.soilType")}</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="input-field pl-10">
                    {SOIL_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("form.season")}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select value={season} onChange={(e) => setSeason(e.target.value)} className="input-field pl-10">
                    {SEASONS.map((s) => (
                      <option key={s} value={s}>{t(`season.${s.toLowerCase()}` as any) || s}</option>
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
            </div>
            <div className="mt-6">
              <button type="button" onClick={handleAnalyze} disabled={loading} className="btn-primary">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("form.getRecommendations")
                )}
              </button>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={isHindi ? "आत्मविश्वास" : "Confidence"} subtitle={isHindi ? "निर्धारक नियम-आधारित स्कोरिंग" : "Deterministic rule-based scoring"} />
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-surface-200 p-3">
                <span className="text-sm font-medium text-surface-700">{isHindi ? "आत्मविश्वास" : "Confidence"}</span>
                <span className="text-lg font-display font-semibold text-primary-600">
                  {result ? `${(result.confidence * 100).toFixed(0)}%` : "–"}
                </span>
              </div>
              {result?.weather && (
                <div className="flex items-center gap-2 rounded-lg border border-surface-200 p-2 text-sm text-surface-600">
                  <CloudRain className="h-4 w-4 shrink-0" />
                  <span>
                    {isHindi ? `${result.weather.city} पर मौसम: ` : `Weather at ${result.weather.city}: `}
                    {result.weather.temperatureC} C, {result.weather.precipitationMm} {isHindi ? "मिमी वर्षा" : "mm precip."}
                  </span>
                </div>
              )}
              {!result && (
                <div className="flex items-start gap-2 rounded-lg border border-surface-200 p-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-surface-500" />
                  <p className="text-sm text-surface-600">{t("crop.enterInputs")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader title={t("crop.rankedRecommendations")} subtitle={t("crop.suitabilityYieldWater")} />
          <CardContent>
            {!result?.recommendedCrops?.length ? (
              <p className="text-surface-500">{t("crop.noRecommendations")}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.recommendedCrops.map((c) => (
                  <div key={c.crop} className="rounded-xl border border-surface-200 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-display font-semibold text-surface-900">{c.crop}</h4>
                      <span className="rounded-full bg-primary-100 px-2.5 py-1 text-sm font-medium text-primary-700">
                        {c.suitabilityScore}%
                      </span>
                    </div>
                    <dl className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-surface-500">{t("crop.expectedYield")}</dt>
                        <dd className="font-medium text-surface-800">{c.expectedYield.toFixed(1)} {isHindi ? "टन/हेक्टेयर" : "t/ha"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-surface-500">{t("crop.waterNeed")}</dt>
                        <dd className="font-medium text-surface-800">{Math.round(c.waterRequirement)} mm</dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-xs text-surface-500">{c.explanation || c.riskFactors?.[0] || ""}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Seed Buying Recommendations */}
      {result?.recommendedCrops && result.recommendedCrops.length > 0 && (
        <section>
          <SeedBuying
            selectedCrop={result.recommendedCrops[0]?.crop}
            showLowStock={result.recommendedCrops[0]?.suitabilityScore < 60}
          />
        </section>
      )}
    </div>
  );
};
