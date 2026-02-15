import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Package, Calendar, Filter, FileText, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { schemesApi, cropApi, type SchemeEligibleItem } from "../lib/api";
import { useTranslation } from "../lib/translations";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../lib/translations";

const STATE_OPTIONS = [
  "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

const SEASON_OPTIONS = ["All", "Kharif", "Rabi", "Zaid"] as const;
const FARMER_TYPE_OPTIONS = ["Any", "Small", "Marginal", "Large"] as const;

export const GovernmentSchemes: React.FC = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");
  const [season, setSeason] = useState<string>("All");
  const [farmerType, setFarmerType] = useState<string>("Any");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SchemeEligibleItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cropOptions, setCropOptions] = useState<string[]>([]);

  // Fetch logic: only depend on primitive filter values to avoid infinite loop (no t/fetchSchemes in deps).
  const fetchSchemes = useCallback(async () => {
    if (!state.trim()) {
      setError(t("schemes.selectState" as TranslationKey));
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const payload: Parameters<typeof schemesApi.getEligible>[0] = {
        state: state.trim(),
        district: district.trim() || undefined,
        crop: crop.trim() || undefined,
        season: season && season !== "All" ? season : undefined,
        farmer_type: farmerType && farmerType !== "Any" ? farmerType : undefined,
      };
      const res = await schemesApi.getEligible(payload);
      setResults(res.schemes || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("validation.requestFailed"));
    } finally {
      setLoading(false);
    }
  }, [state, district, crop, season, farmerType, t]);

  const applyFilters = useCallback(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // Load crop list from database (single source of truth for filter)
  useEffect(() => {
    cropApi.list().then((r) => setCropOptions(r.crops || [])).catch(() => setCropOptions([]));
  }, []);

  // Load schemes when state is selected; refetch when optional filters change. Do NOT add t or fetchSchemes
  // to deps - t changes identity and causes infinite re-renders/API calls. Use primitive filter deps only.
  React.useEffect(() => {
    if (!state.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setResults([]);
    const payload: Parameters<typeof schemesApi.getEligible>[0] = {
      state: state.trim(),
      district: district.trim() || undefined,
      crop: crop.trim() || undefined,
      season: season && season !== "All" ? season : undefined,
      farmer_type: farmerType && farmerType !== "Any" ? farmerType : undefined,
    };
    schemesApi.getEligible(payload).then(
      (res) => {
        if (!cancelled) setResults(res.schemes || []);
      },
      (e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Request failed.");
      }
    ).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [state, district, crop, season, farmerType]);

  const schemeName = (item: SchemeEligibleItem) => (isHindi && item.scheme.name_hi ? item.scheme.name_hi : item.scheme.name);
  const schemeBenefits = (item: SchemeEligibleItem) => (isHindi && item.scheme.benefits_hi ? item.scheme.benefits_hi : item.scheme.benefits);
  const schemeEligibility = (item: SchemeEligibleItem) => (isHindi && item.scheme.eligibility_text_hi ? item.scheme.eligibility_text_hi : item.scheme.eligibility_text);
  const schemeProcess = (item: SchemeEligibleItem) => (isHindi && item.scheme.application_process_hi ? item.scheme.application_process_hi : item.scheme.application_process);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-fade-in">
      <div className="mb-4 flex-shrink-0 lg:sticky lg:top-4 lg:self-start lg:w-72">
        <Card className="p-4">
          <CardHeader
            title={t("schemes.filters" as TranslationKey)}
            subtitle={t("schemes.subtitle" as TranslationKey)}
            className="border-b border-surface-200 pb-3"
          />
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">
                {t("schemes.state" as TranslationKey)} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input-field w-full pl-9"
                >
                  <option value="">{t("common.select")} {t("schemes.state" as TranslationKey)}</option>
                  {STATE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">{t("schemes.district" as TranslationKey)}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="input-field w-full"
                placeholder={t("common.optional")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">{t("schemes.crop" as TranslationKey)}</label>
              <p className="mb-1.5 text-xs text-surface-500">
                {t("schemes.selectCropOptional" as TranslationKey)}
              </p>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="input-field w-full pl-9"
                >
                  <option value="">{t("common.select")} {t("schemes.crop" as TranslationKey)}</option>
                  {cropOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">{t("schemes.season" as TranslationKey)}</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="input-field w-full"
              >
                {SEASON_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === "All" ? t("common.all") : t(`schemes.${s.toLowerCase()}` as TranslationKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">{t("schemes.farmerType" as TranslationKey)}</label>
              <select
                value={farmerType}
                onChange={(e) => setFarmerType(e.target.value)}
                className="input-field w-full"
              >
                {FARMER_TYPE_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f === "Any" ? t("common.any") : t(`schemes.${f.toLowerCase()}` as TranslationKey)}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={applyFilters}
              disabled={loading}
              className="btn-primary w-full gap-2"
            >
              <Filter className="h-4 w-4" />
              {loading ? t("common.loading") : t("schemes.applyFilters" as TranslationKey)}
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 flex-1 overflow-auto">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-surface-900">{t("schemes.title" as TranslationKey)}</h2>
            <p className="text-surface-500 text-sm">
              {state.trim()
                ? crop.trim()
                  ? (isHindi ? `${state} में ${crop} के लिए ${results.length} योजनाएं` : `Showing ${results.length} schemes for ${crop} in ${state}`)
                  : (isHindi ? `${state} के लिए ${results.length} योजनाएं दिख रही हैं` : `Showing ${results.length} schemes for ${state}`)
                : t("schemes.subtitle" as TranslationKey)}
            </p>
          </div>
          <Link
            to="/schemes/admin"
            className="shrink-0 rounded bg-surface-200 px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-300"
          >
            {t("schemes.adminTitle" as TranslationKey)}
          </Link>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <span className="text-surface-500">{t("common.loading")}</span>
          </div>
        )}
        {!loading && results.length === 0 && !error && (
          <p className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-6 text-center text-surface-600">
            {state.trim() ? t("schemes.noSchemes" as TranslationKey) : t("schemes.selectStateError" as TranslationKey)}
          </p>
        )}
        <div className="space-y-4">
          {results.map((item) => (
            <Card key={item.scheme.id} className="overflow-hidden">
              <CardHeader
                title={schemeName(item)}
                className="border-b border-surface-200 bg-surface-50/50 px-4 py-3"
              />
              <CardContent className="space-y-3 px-4 py-3">
                {(item.scheme.scheme_level || item.scheme.benefit_tags) && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.scheme.scheme_level && (
                      <span className="rounded bg-surface-200 px-2 py-0.5 text-xs font-medium text-surface-700">{item.scheme.scheme_level}</span>
                    )}
                    {item.scheme.benefit_tags && item.scheme.benefit_tags.split(",").map((tag) => (
                      <span key={tag} className="rounded bg-primary-100 px-2 py-0.5 text-xs text-primary-800">{tag.trim()}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-surface-600">{item.scheme.description}</p>
                <div>
                  <span className="text-xs font-medium text-surface-500">{t("schemes.keyBenefits" as TranslationKey)}</span>
                  <p className="text-sm text-surface-800">{schemeBenefits(item)}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-surface-500">{t("schemes.eligibilitySummary" as TranslationKey)}</span>
                  <p className="text-sm text-surface-800">{schemeEligibility(item)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-surface-500">{t("schemes.applicationMode" as TranslationKey)}:</span>
                  {(item.application_mode || []).map((m) => (
                    <span key={m} className="rounded bg-primary-100 px-2 py-0.5 text-xs text-primary-800">{m}</span>
                  ))}
                </div>
                {item.scheme.deadline && (
                  <div className="flex items-center gap-2 text-sm text-surface-600">
                    <Calendar className="h-4 w-4" />
                    {t("schemes.deadline" as TranslationKey)}: {item.scheme.deadline}
                  </div>
                )}
                <p className="text-xs text-surface-500">{isHindi ? item.eligibility_reason_hi : item.eligibility_reason}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {(item.scheme.external_link || item.scheme.source_url) && (
                    <a
                      href={item.scheme.external_link || item.scheme.source_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("schemes.learnMore" as TranslationKey)}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setDetailId(detailId === item.scheme.id ? null : item.scheme.id)}
                    className="rounded bg-surface-200 px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-300"
                  >
                    <FileText className="mr-1.5 inline h-4 w-4" />
                    {t("schemes.viewDetails" as TranslationKey)}
                  </button>
                  <span className="rounded bg-primary-100 px-3 py-1.5 text-sm text-primary-800">
                    {t("schemes.howToApply" as TranslationKey)}: {schemeProcess(item)}
                  </span>
                </div>
                {detailId === item.scheme.id && (
                  <div className="mt-3 rounded border border-surface-200 bg-surface-50 p-3 text-sm">
                    <p><strong>{t("schemes.applicationMode" as TranslationKey)}</strong>: {item.scheme.application_mode}</p>
                    <p className="mt-1">{schemeProcess(item)}</p>
                    {(item.scheme.external_link || item.scheme.source_url) && (
                      <a href={item.scheme.external_link || item.scheme.source_url || '#'} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-primary-600 hover:underline">
                        <ExternalLink className="h-4 w-4" /> {t("schemes.officialWebsite" as TranslationKey)}
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
