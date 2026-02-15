import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { signInWithEmail, signInWithGoogle } from "../lib/auth";
import { useTranslation } from "../lib/translations";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = useMemo(() => {
    if (!email) return null;
    if (!isValidEmail(email)) return "Enter a valid email address.";
    return null;
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return null;
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  }, [password]);

  const canSubmit = isValidEmail(email) && password.length >= 6 && !loading && !googleLoading;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      nav(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      nav(redirectTo, { replace: true });
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
            {t("auth.signIn")}{" "}
            <span className="font-semibold">KrishiBodh</span>
          </h1>
          <p className="text-base text-surface-600 max-w-md">
            Continue into your calm, AI-guided workspace for weather,
            soil, crop, and market intelligence—grounded in real field
            conditions.
          </p>

          {/* Abstract AI + agriculture visual */}
          <div className="mt-6 w-full max-w-md h-64 rounded-3xl bg-gradient-to-br from-emerald-100/70 via-emerald-50/60 to-green-50 shadow-xl overflow-hidden">
            <div className="relative w-full h-full">
              <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-[#e9f3e6] via-[#c7e0c3] to-[#98b892] overflow-hidden">
                <div className="absolute inset-5 rounded-2xl border border-white/60 bg-[radial-gradient(circle_at_top,_rgba(250,248,243,0.4),_transparent_60%)] bg-[length:22px_22px] bg-repeat opacity-70" />

                {/* Small data chips */}
                <div className="absolute left-6 top-6 px-3 py-2 bg-white/90 rounded-xl shadow-md text-[11px] text-surface-700 space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium bg-emerald-50/80 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Moisture window
                  </div>
                  <div className="font-semibold text-[11px] text-surface-900">
                    Next 4 days
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    +18% yield band
                  </div>
                </div>

                <div className="absolute right-6 top-10 px-3 py-2 bg-white/90 rounded-xl shadow-md text-[11px] text-surface-700 space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-700 font-medium bg-amber-50/80 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Pest pressure
                  </div>
                  <div className="font-semibold text-[11px] text-surface-900">
                    Stem borer
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold">
                    11 clusters to scout
                  </div>
                </div>

                <div className="absolute left-10 bottom-8 px-3 py-2 bg-white/90 rounded-xl shadow-md text-[11px] text-surface-700 space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-[10px] text-sky-700 font-medium bg-sky-50/80 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    Market mix
                  </div>
                  <div className="font-semibold text-[11px] text-surface-900">
                    Soybean · Maize
                  </div>
                  <div className="text-[10px] text-sky-700 font-semibold">
                    ₹3,200 / acre delta
                  </div>
                </div>

                <div className="absolute right-6 bottom-6 px-3 py-1.5 rounded-full bg-slate-900/90 text-[10px] text-slate-100 inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  KrishiBodh quietly sorts today&apos;s priorities for you.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Side */}
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
              {t("auth.signIn")}
            </h1>
            <p className="mt-1 text-sm text-surface-500">
              {t("auth.accessWorkspace")}
            </p>
          </div>

          <Card className="shadow-card bg-white/95 border border-surface-200/70 rounded-2xl backdrop-blur-md">
            <CardHeader
              title={t("auth.welcomeBack")}
              subtitle={t("auth.useEmailPasswordOrGoogle")}
            />
            <CardContent>
              {/* Google sign-in */}
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

              <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                      placeholder={t("auth.password") || "Your password"}
                      autoComplete="current-password"
                    />
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordError}
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
                      {t("auth.signingIn")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {t("auth.signIn")}
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </button>
              </form>

              <p className="mt-6 text-sm text-surface-600">
                {t("auth.dontHaveAccount")}{" "}
                <Link
                  to="/signup"
                  className="font-medium text-primary-700 hover:text-primary-800"
                >
                  {t("auth.createAccount")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

