import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { signInWithGoogle, signUpWithEmail } from "../lib/auth";
import { useTranslation } from "../lib/translations";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function strengthScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (/[A-Z]/.test(pw)) s += 1;
  if (/[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return s; // 0..5
}

function strengthLabel(score: number) {
  if (score >= 4) return { label: "Strong", color: "bg-green-500" };
  if (score >= 3) return { label: "Good", color: "bg-primary-600" };
  if (score >= 2) return { label: "Fair", color: "bg-amber-500" };
  return { label: "Weak", color: "bg-red-500" };
}

export const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useMemo(() => strengthScore(password), [password]);
  const strength = useMemo(() => strengthLabel(score), [score]);

  const emailError = useMemo(() => {
    if (!email) return null;
    if (!isValidEmail(email)) return "Enter a valid email address.";
    return null;
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return "Use at least 8 characters.";
    return null;
  }, [password]);

  const confirmError = useMemo(() => {
    if (!confirm) return null;
    if (confirm !== password) return "Passwords do not match.";
    return null;
  }, [confirm, password]);

  const canSubmit =
    isValidEmail(email) &&
    password.length >= 8 &&
    confirm === password &&
    !loading &&
    !googleLoading;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password);
      nav("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      nav("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr] bg-[radial-gradient(circle_at_top,#f5f7f4_0,#faf8f3_52%)]"
      style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* Brand / Visual Side */}
      <div className="relative hidden lg:flex items-center justify-center px-10 py-12 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/40 to-green-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-amber-100/60 to-emerald-100/40 blur-3xl" />

        <div className="relative max-w-xl space-y-6">
          <div className="text-4xl" aria-hidden="true">
            🌾
          </div>
          <h1
            className="text-3xl lg:text-4xl font-normal tracking-tight"
            style={{
              fontFamily: "'Crimson Pro', serif",
              letterSpacing: "-0.04em",
              backgroundImage:
                "linear-gradient(135deg,#2d5016,#7a9b76)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("auth.signUp")}{" "}
            <span className="font-semibold">KrishiBodh</span>
          </h1>
          <p className="text-base text-surface-600 max-w-md">
            Create a calm, AI-enabled workspace for your fields, crops and
            programmes. One account connects weather, soil, yield and market
            intelligence in a single view.
          </p>

          {/* Abstract visual reused for continuity */}
          <div className="mt-6 w-full max-w-md h-64 rounded-3xl bg-gradient-to-br from-emerald-100/70 via-emerald-50/60 to-green-50 shadow-xl overflow-hidden">
            <div className="relative w-full h-full">
              <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-[#e9f3e6] via-[#c7e0c3] to-[#98b892] overflow-hidden">
                <div className="absolute inset-5 rounded-2xl border border-white/60 bg-[radial-gradient(circle_at_top,_rgba(250,248,243,0.4),_transparent_60%)] bg-[length:22px_22px] bg-repeat opacity-70" />

                <div className="absolute left-6 top-6 px-3 py-2 bg-white/90 rounded-xl shadow-md text-[11px] text-surface-700 space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium bg-emerald-50/80 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Pilot region
                  </div>
                  <div className="font-semibold text-[11px] text-surface-900">
                    3 districts
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    2 seasons of learning
                  </div>
                </div>

                <div className="absolute right-6 top-10 px-3 py-2 bg-white/90 rounded-xl shadow-md text-[11px] text-surface-700 space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-700 font-medium bg-amber-50/80 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Teams onboarded
                  </div>
                  <div className="font-semibold text-[11px] text-surface-900">
                    Agronomy · Field
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold">
                    Shared, living workspace
                  </div>
                </div>

                <div className="absolute left-10 bottom-8 px-3 py-2 bg-white/90 rounded-xl shadow-md text-[11px] text-surface-700 space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-[10px] text-sky-700 font-medium bg-sky-50/80 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    Outcomes
                  </div>
                  <div className="font-semibold text-[11px] text-surface-900">
                    Clear next actions
                  </div>
                  <div className="text-[10px] text-sky-700 font-semibold">
                    Less noise, more signal
                  </div>
                </div>

                <div className="absolute right-6 bottom-6 px-3 py-1.5 rounded-full bg-slate-900/90 text-[10px] text-slate-100 inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  KrishiBodh grows more accurate with every season you add.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-up Form Side */}
      <div className="flex items-center justify-center px-4 py-10 lg:px-8">
        <div className="w-full max-w-[440px] animate-slide-up">
          <div className="mb-6 lg:hidden">
            <div className="text-3xl mb-2" aria-hidden="true">
              🌾
            </div>
            <h1
              className="text-2xl sm:text-3xl font-display font-semibold text-surface-900"
              style={{ letterSpacing: "-0.03em" }}
            >
              {t("auth.signUp")}
            </h1>
            <p className="mt-1 text-sm text-surface-500">
              {t("auth.setupWorkspace")}
            </p>
          </div>

          <Card className="shadow-card bg-white/95 border border-surface-200/70 rounded-2xl backdrop-blur-md">
            <CardHeader
              title={t("auth.getStarted")}
              subtitle={t("auth.useEmailPasswordOrGoogle")}
            />
            <CardContent>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading || googleLoading}
                className="btn-secondary w-full justify-center transition-transform active:scale-[0.99] bg-white border border-surface-200 hover:border-surface-300 shadow-sm"
              >
                {googleLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-300 border-t-primary-600" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("auth.continueWithGoogle")
                )}
              </button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-200" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-surface-400">
                  or
                </span>
                <div className="h-px flex-1 bg-surface-200" />
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">
                    {t("auth.password")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Create a password"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-500">
                        Password strength
                      </span>
                      <span className="text-xs font-medium text-surface-700">
                        {strength.label}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-surface-200 overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all`}
                        style={{
                          width: `${Math.min(100, (score / 5) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">
                    {t("auth.confirmPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </div>
                  {confirmError && (
                    <p className="mt-1 text-sm text-red-600">
                      {confirmError}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn-primary w-full justify-center transition-transform active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t("auth.creating")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {t("auth.createAccount")}
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </button>
              </form>

              <p className="mt-6 text-sm text-surface-600">
                {t("auth.alreadyHaveAccount")}{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-700 hover:text-primary-800"
                >
                  {t("auth.signIn")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

