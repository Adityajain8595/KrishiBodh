import React, { useState, useCallback } from "react";
import { MapPin, Package, Building2, Search, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { marketApi } from "../lib/api";
import type { MarketPricesResponse, MarketPriceItem } from "../lib/api";
import { useTranslation } from "../lib/translations";
import { useLanguage } from "../contexts/LanguageContext";

const CROP_OPTIONS = [
  "Rice",
  "Wheat",
  "Maize",
  "Cotton",
  "Sugarcane",
  "Chickpea",
  "Lentil",
  "Mustard",
  "Groundnut",
  "Potato",
  "Onion",
  "Tomato",
  "Soybean",
  "Barley",
  "Pearl Millet",
  "Pigeon Pea",
];

export const MarketPrices: React.FC = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();
  const [crop, setCrop] = useState("");
  const [state, setState] = useState("");
  const [mandi, setMandi] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketPricesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketApi.getPrices({
        crop: crop.trim() || undefined,
        state: state.trim() || undefined,
        mandi: mandi.trim() || undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("validation.requestFailed"));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [crop, state, mandi, t]);

  const prices = result?.prices ?? [];
  const dataNotAvailable = result?.dataNotAvailable ?? false;
  const source = result?.source;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-surface-500 text-base">
          {t("market.subtitle")}
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={t("common.filter")} subtitle={isHindi ? "फसल, राज्य, या मंडी (वैकल्पिक)" : "Crop, state, or mandi (optional)"} />
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("market.commodity")}</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <select value={crop} onChange={(e) => setCrop(e.target.value)} className="input-field pl-10 w-full">
                    <option value="">{isHindi ? "सभी" : "All"}</option>
                    {CROP_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("market.state")}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="input-field pl-10 w-full"
                    placeholder="e.g. Karnataka"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-700">{t("market.market")}</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    value={mandi}
                    onChange={(e) => setMandi(e.target.value)}
                    className="input-field pl-10 w-full"
                    placeholder="e.g. Bengaluru"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button type="button" onClick={handleFetch} disabled={loading} className="btn-primary inline-flex items-center gap-2">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    {isHindi ? "मूल्य प्राप्त करें" : "Fetch prices"}
                  </>
                )}
              </button>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={isHindi ? "डेटा स्रोत" : "Data source"} subtitle={isHindi ? "सत्यापन योग्य सरकारी डेटा" : "Verifiable government data"} />
          <CardContent>
            <p className="text-sm text-surface-600">
              {source || (isHindi
                ? "भारत ओपन गवर्नमेंट डेटा (data.gov.in), AGMARKNET से डेटा। लाइव डेटा सक्षम करने के लिए बैकएंड में DATA_GOV_IN_API_KEY सेट करें।"
                : "Data from India Open Government Data (data.gov.in), AGMARKNET. Set DATA_GOV_IN_API_KEY in backend to enable live data.")}
            </p>
            {dataNotAvailable && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">{t("market.dataNotAvailable")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader title={t("market.title")} subtitle={isHindi ? "न्यूनतम, अधिकतम, मोडल और तारीख" : "Min, max, modal and date"} />
          <CardContent>
            {!result ? (
              <p className="text-surface-500">{isHindi ? "वास्तविक बाजार डेटा लोड करने के लिए ऊपर दिए गए फ़िल्टर का उपयोग करें और मूल्य प्राप्त करें पर क्लिक करें।" : "Use the filter above and click Fetch prices to load real market data."}</p>
            ) : dataNotAvailable && prices.length === 0 ? (
              <p className="text-surface-600">
                {isHindi
                  ? "चयनित फ़िल्टर के लिए डेटा उपलब्ध नहीं है। सुनिश्चित करें कि बैकएंड में DATA_GOV_IN_API_KEY सेट है, या किसी अन्य फसल या राज्य को आज़माएं।"
                  : "Data not available for the selected filters. Ensure DATA_GOV_IN_API_KEY is set in the backend, or try another crop or state."}
              </p>
            ) : prices.length === 0 ? (
              <p className="text-surface-600">{isHindi ? "चयनित फ़िल्टर के लिए कोई रिकॉर्ड नहीं मिला।" : "No records found for the selected filters."}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="pb-3 text-left font-medium text-surface-700">{t("market.commodity")}</th>
                      <th className="pb-3 text-left font-medium text-surface-700">{t("market.state")}</th>
                      <th className="pb-3 text-left font-medium text-surface-700">{t("market.district")}</th>
                      <th className="pb-3 text-left font-medium text-surface-700">{t("market.market")}</th>
                      <th className="pb-3 text-right font-medium text-surface-700">{t("market.minPrice")}</th>
                      <th className="pb-3 text-right font-medium text-surface-700">{t("market.maxPrice")}</th>
                      <th className="pb-3 text-right font-medium text-surface-700">{t("market.modalPrice")}</th>
                      <th className="pb-3 text-left font-medium text-surface-700">{t("market.date")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((p: MarketPriceItem, i: number) => (
                      <tr key={i} className="border-b border-surface-100">
                        <td className="py-2 font-medium text-surface-800">{p.commodity || "–"}</td>
                        <td className="py-2 text-surface-600">{p.state || "–"}</td>
                        <td className="py-2 text-surface-600">{p.district || "–"}</td>
                        <td className="py-2 text-surface-600">{p.market || "–"}</td>
                        <td className="py-2 text-right text-surface-700">{p.minPrice != null ? p.minPrice : "–"}</td>
                        <td className="py-2 text-right text-surface-700">{p.maxPrice != null ? p.maxPrice : "–"}</td>
                        <td className="py-2 text-right text-surface-700">{p.modalPrice != null ? p.modalPrice : "–"}</td>
                        <td className="py-2 text-surface-600">{p.date || "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

