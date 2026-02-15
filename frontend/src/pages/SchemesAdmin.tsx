import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Plus, Pencil, X } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { schemesApi, cropApi } from "../lib/api";
import { useTranslation } from "../lib/translations";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../lib/translations";

const STATE_OPTIONS = [
  "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

interface SchemeRow {
  id: string;
  name: string;
  name_hi?: string;
  description?: string;
  is_active?: boolean;
  scheme_level?: string;
  benefit_tags?: string;
  needs_admin_review?: boolean;
  external_link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  deadline?: string | null;
}

export const SchemesAdmin: React.FC = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();
  const [list, setList] = useState<SchemeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSchemeLevel, setAddSchemeLevel] = useState<"Central" | "State">("State");
  const [addState, setAddState] = useState("");
  const [addExternalLink, setAddExternalLink] = useState("");
  const [addCrops, setAddCrops] = useState<string[]>([]);
  const [addNeedsReview, setAddNeedsReview] = useState(true);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [cropOptions, setCropOptions] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editExternalLink, setEditExternalLink] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editNeedsReview, setEditNeedsReview] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await schemesApi.list(true);
      setList((res.schemes || []) as SchemeRow[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("validation.requestFailed");
      setError(msg);
      console.error("[SchemesAdmin] Failed to load schemes:", e);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Load crop list for mapping (from crops table / API)
  useEffect(() => {
    cropApi.list().then((r) => setCropOptions(r.crops || [])).catch(() => setCropOptions([]));
  }, []);

  // Load schemes once on mount. Do NOT use fetchList in deps (t changes identity → infinite loop).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    schemesApi.list(true).then(
      (res) => {
        if (!cancelled) setList((res.schemes || []) as SchemeRow[]);
      },
      (e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("validation.requestFailed"));
          console.error("[SchemesAdmin] Failed to load schemes:", e);
        }
      }
    ).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleDeactivate = async (id: string) => {
    setActionLoading(id);
    setError(null);
    try {
      await schemesApi.deactivate(id);
      await fetchList();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("validation.requestFailed");
      setError(msg);
      console.error("[SchemesAdmin] Deactivate failed:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    setError(null);
    try {
      await schemesApi.update(id, { is_active: true });
      await fetchList();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("validation.requestFailed");
      setError(msg);
      console.error("[SchemesAdmin] Activate failed:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      setError(t("validation.required"));
      return;
    }
    if (addSchemeLevel === "State" && !addState.trim()) {
      setError(t("schemes.selectStateForStateLevel" as TranslationKey));
      return;
    }
    setAddSubmitting(true);
    setError(null);
    try {
      const stateForRegion = addSchemeLevel === "Central" ? "All India" : addState.trim();
      const cropsPayload = addCrops.length > 0
        ? addCrops.map((c) => ({ crop_name: c, season: "All" }))
        : [{ crop_name: "All", season: "All" }];
      await schemesApi.create({
        name: addName.trim(),
        name_hi: addName.trim(),
        description: t("schemes.description"),
        is_active: true,
        scheme_level: addSchemeLevel,
        needs_admin_review: addNeedsReview,
        external_link: addExternalLink.trim() || null,
        regions: [{ state: stateForRegion, district: null }],
        crops: cropsPayload,
        farmer_types: ["Small", "Marginal", "Large"],
      });
      setAddName("");
      setAddState("");
      setAddExternalLink("");
      setAddCrops([]);
      setAddNeedsReview(true);
      setShowAdd(false);
      await fetchList();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("validation.requestFailed");
      setError(msg);
      console.error("[SchemesAdmin] Create failed:", e);
    } finally {
      setAddSubmitting(false);
    }
  };

  const openEdit = (s: SchemeRow) => {
    setEditId(s.id);
    setEditName(s.name || "");
    setEditDescription(s.description || "");
    setEditExternalLink(s.external_link || "");
    setEditActive(s.is_active !== false);
    setEditNeedsReview(Boolean(s.needs_admin_review));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditSubmitting(true);
    setError(null);
    try {
      await schemesApi.update(editId, {
        name: editName.trim(),
        description: editDescription.trim(),
        is_active: editActive,
        needs_admin_review: editNeedsReview,
        external_link: editExternalLink.trim() || null,
      });
      setEditId(null);
      await fetchList();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("validation.requestFailed");
      setError(msg);
      console.error("[SchemesAdmin] Update failed:", e);
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-surface-900">{t("schemes.adminTitle" as TranslationKey)}</h2>
        <p className="text-surface-500 text-sm">{t("schemes.subtitle" as TranslationKey)}</p>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Card>
        <CardHeader
          title={t("schemes.addSchemeTitle" as TranslationKey)}
          subtitle={t("schemes.nameStateRequired" as TranslationKey)}
          action={
            <button
              type="button"
              onClick={() => setShowAdd(!showAdd)}
              className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus className="inline h-4 w-4 mr-1" />
              {showAdd ? t("common.cancel") : t("schemes.addScheme" as TranslationKey)}
            </button>
          }
        />
        {showAdd && (
          <CardContent className="border-t border-surface-200 pt-4">
            <form onSubmit={handleAddSubmit} className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("schemes.schemeName" as TranslationKey)}</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="input-field w-64"
                  placeholder={t("schemes.schemeName" as TranslationKey)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("schemes.level" as TranslationKey)}</label>
                <select value={addSchemeLevel} onChange={(e) => setAddSchemeLevel(e.target.value as "Central" | "State")} className="input-field w-36">
                  <option value="Central">{t("schemes.central" as TranslationKey)}</option>
                  <option value="State">{t("schemes.stateLevel" as TranslationKey)}</option>
                </select>
              </div>
              {addSchemeLevel === "State" && (
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("schemes.state" as TranslationKey)}</label>
                  <select value={addState} onChange={(e) => setAddState(e.target.value)} className="input-field w-48">
                    <option value="">{t("common.select")}</option>
                    {STATE_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="w-full">
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("schemes.externalLinkOptional" as TranslationKey)}</label>
                <input type="url" value={addExternalLink} onChange={(e) => setAddExternalLink(e.target.value)} className="input-field w-full max-w-md" placeholder="https://..." />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("schemes.cropsEmptyAll" as TranslationKey)}</label>
                <select multiple value={addCrops} onChange={(e) => setAddCrops(Array.from(e.target.selectedOptions, (o) => o.value))} className="input-field w-full max-w-md min-h-[80px]">
                  {cropOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="add-needs-review" checked={addNeedsReview} onChange={(e) => setAddNeedsReview(e.target.checked)} className="rounded border-surface-300" />
                <label htmlFor="add-needs-review" className="text-sm text-surface-700">{t("schemes.needsReview" as TranslationKey)}</label>
              </div>
              <button type="submit" disabled={addSubmitting} className="btn-primary">
                {addSubmitting ? t("common.loading") : t("common.save")}
              </button>
            </form>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader
          title={t("schemes.schemesList" as TranslationKey)}
          subtitle={t("schemes.addEditDeactivate" as TranslationKey)}
          action={
            <button
              type="button"
              onClick={fetchList}
              disabled={loading}
              className="rounded bg-surface-200 px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-300"
            >
              <RefreshCw className={`inline h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="ml-1.5">{t("common.refresh")}</span>
            </button>
          }
        />
        <CardContent>
          {loading ? (
            <p className="text-surface-500">{t("common.loading")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-200 text-surface-600">
                    <th className="pb-2 pr-4 font-medium">{t("schemes.id" as TranslationKey)}</th>
                    <th className="pb-2 pr-4 font-medium">{t("schemes.schemeName" as TranslationKey)}</th>
                    <th className="pb-2 pr-4 font-medium">{t("schemes.level" as TranslationKey)}</th>
                    <th className="pb-2 pr-4 font-medium">{t("schemes.active" as TranslationKey)}</th>
                    <th className="pb-2 pr-4 font-medium">{t("schemes.needsReview" as TranslationKey)}</th>
                    <th className="pb-2 pr-4 font-medium">{t("schemes.deadline" as TranslationKey)}</th>
                    <th className="pb-2 font-medium">{t("schemes.actions" as TranslationKey)}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((s) => (
                    <tr key={s.id} className="border-b border-surface-100">
                      <td className="py-3 pr-4 font-mono text-surface-600">{s.id}</td>
                      <td className="py-3 pr-4">{isHindi && s.name_hi ? s.name_hi : s.name}</td>
                      <td className="py-3 pr-4 text-xs">{s.scheme_level || "State"}</td>
                      <td className="py-3 pr-4">{s.is_active !== false ? t("common.yes") : t("common.no")}</td>
                      <td className="py-3 pr-4">{s.needs_admin_review ? t("common.yes") : "—"}</td>
                      <td className="py-3 pr-4">{s.deadline || "—"}</td>
                      <td className="py-3 flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          className="rounded border border-surface-300 px-2 py-1 text-xs text-surface-700 hover:bg-surface-100"
                          title={t("common.edit")}
                        >
                          <Pencil className="inline h-3 w-3" />
                        </button>
                        {s.is_active !== false ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(s.id)}
                            disabled={actionLoading === s.id}
                            className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {actionLoading === s.id ? t("common.loading") : t("schemes.deactivate" as TranslationKey)}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivate(s.id)}
                            disabled={actionLoading === s.id}
                            className="rounded border border-green-200 px-2 py-1 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
                          >
                            {actionLoading === s.id ? t("common.loading") : t("schemes.activate" as TranslationKey)}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {list.length === 0 && !loading && (
                <p className="py-6 text-center text-surface-500">{t("schemes.noSchemesAdmin" as TranslationKey)}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditId(null)}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-surface-900 mb-4">{t("schemes.editSchemeTitle" as TranslationKey)}</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("schemes.schemeName" as TranslationKey)}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("schemes.description" as TranslationKey)}</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="input-field w-full min-h-[80px]"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("schemes.officialWebsite" as TranslationKey)}</label>
                <input type="url" value={editExternalLink} onChange={(e) => setEditExternalLink(e.target.value)} className="input-field w-full" placeholder="https://..." />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="edit-active" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="rounded border-surface-300" />
                  <label htmlFor="edit-active" className="text-sm text-surface-700">{t("schemes.active" as TranslationKey)}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="edit-needs-review" checked={editNeedsReview} onChange={(e) => setEditNeedsReview(e.target.checked)} className="rounded border-surface-300" />
                  <label htmlFor="edit-needs-review" className="text-sm text-surface-700">{t("schemes.needsReview" as TranslationKey)}</label>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setEditId(null)} className="rounded border border-surface-300 px-3 py-1.5 text-sm text-surface-700 hover:bg-surface-100">
                  <X className="inline h-4 w-4 mr-1" /> {t("common.cancel")}
                </button>
                <button type="submit" disabled={editSubmitting} className="btn-primary">
                  {editSubmitting ? t("common.loading") : t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
