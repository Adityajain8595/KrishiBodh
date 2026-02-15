import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Droplets,
  Sprout,
  ShieldCheck,
  ChevronRight,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Bot,
  Download,
  RefreshCw,
  Calendar,
  Cloud,
  Leaf,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { MetricCard } from "../components/dashboard/MetricCard";
import { ChartCard } from "../components/dashboard/ChartCard";
import { Skeleton } from "../components/ui/Skeleton";
import { api } from "../lib/api";
import { useTranslation } from "../lib/translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useDashboardData } from "../hooks/useDashboardData";
import cn from "classnames";

// Enhanced green palette matching landing page theme
const GREEN_PALETTE = {
  forest: "#2d5016",
  sage: "#7a9b76",
  mint: "#a8d5ba",
  moss: "#8fb896",
  emerald: "#10b981",
  soft: "#f0fdf4",
  mist: "#f5f7f4",
  earth: "#8b7355",
  deep: "#3d3428",
};

const CHART_COLORS = {
  kharif: GREEN_PALETTE.forest,
  rabi: "#ca8a04",
  zaid: "#f59e0b",
  primary: GREEN_PALETTE.sage,
  secondary: GREEN_PALETTE.emerald,
  accent: GREEN_PALETTE.mint,
};

// Custom Tooltip with green theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-green-200/60 rounded-xl p-3 shadow-lg text-xs backdrop-blur-sm">
      <div className="font-bold text-slate-800 mb-2">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-slate-600">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ background: p.color }}
          />
          <span className="font-medium">{p.name}:</span>
          <span className="font-bold text-green-700">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data with filters
  const { metrics, charts, loading, error, lastUpdated, weatherUnavailable } = useDashboardData(
    selectedCrop || undefined,
    selectedSeason || undefined,
    selectedLocation || undefined
  );

  React.useEffect(() => {
    api
      .get<{ status: string }>("/health")
      .then((r) => setBackendOk(r?.status === "ok"))
      .catch(() => setBackendOk(false));
  }, []);

  // Get recent selections from localStorage
  React.useEffect(() => {
    try {
      const recentCrop = localStorage.getItem("recent-crop");
      const recentYield = localStorage.getItem("recent-yield");
      const recentIrrigation = localStorage.getItem("recent-irrigation");

      if (recentCrop) {
        const cropData = JSON.parse(recentCrop);
        if (cropData.selectedCrop && !selectedCrop) {
          setSelectedCrop(cropData.selectedCrop);
        }
        if (cropData.season && !selectedSeason) {
          setSelectedSeason(cropData.season);
        }
      }

      if (recentYield) {
        const yieldData = JSON.parse(recentYield);
        if (yieldData.location && !selectedLocation) {
          setSelectedLocation(yieldData.location);
        }
      }

      if (recentIrrigation) {
        const irrigationData = JSON.parse(recentIrrigation);
        if (irrigationData.location && !selectedLocation) {
          setSelectedLocation(irrigationData.location);
        }
      }
    } catch (err) {
      console.warn("Failed to load recent selections:", err);
    }
  }, []);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force re-fetch by updating a dummy state
    setTimeout(() => {
      setRefreshing(false);
      window.location.reload();
    }, 500);
  };

  // Determine metric status based on values
  const getMetricStatus = (
    value: number,
    thresholds: { good: number; warning: number }
  ): "good" | "neutral" | "warning" | "risk" => {
    if (value >= thresholds.good) return "good";
    if (value >= thresholds.warning) return "neutral";
    if (value > 0) return "warning";
    return "risk";
  };

  // Prepare yield chart data - Kharif, Rabi, Zaid only (no Sugarcane)
  const yieldChartData = useMemo(() => {
    if (!charts?.yieldOverTime) return [];
    const data = charts.yieldOverTime.map((item) => ({
      month: item.month,
      Kharif: item.season === "Kharif" ? item.value : 0,
      Rabi: item.season === "Rabi" ? item.value : 0,
      Zaid: item.season === "Zaid" ? item.value : 0,
    }));
    return data;
  }, [charts?.yieldOverTime]);

  // Prepare weather chart data
  const weatherChartData = useMemo(() => {
    if (!charts?.weatherForecast) return [];
    return charts.weatherForecast;
  }, [charts?.weatherForecast]);

  // Prepare soil data
  const soilChartData = useMemo(() => {
    if (!charts?.soilNutrients) return [];
    return charts.soilNutrients.map((item) => ({
      name: item.name,
      value: item.value,
      optimal: item.optimal,
      status: item.value >= item.optimal * 0.9 ? "good" : item.value >= item.optimal * 0.7 ? "neutral" : "warning",
    }));
  }, [charts?.soilNutrients]);

  // Prepare season distribution - Kharif, Rabi, Zaid
  const seasonData = useMemo(() => {
    if (!charts?.yieldOverTime || charts.yieldOverTime.length === 0) {
      return [
        { name: t("season.kharif"), value: 35, color: CHART_COLORS.kharif },
        { name: t("season.rabi"), value: 40, color: CHART_COLORS.rabi },
        { name: t("season.zaid"), value: 25, color: CHART_COLORS.zaid },
      ];
    }

    const kharif = charts.yieldOverTime.filter((d) => d.season === "Kharif").length;
    const rabi = charts.yieldOverTime.filter((d) => d.season === "Rabi").length;
    const zaid = charts.yieldOverTime.filter((d) => d.season === "Zaid").length;
    const total = charts.yieldOverTime.length || 1;

    return [
      { name: t("season.kharif"), value: Math.round((kharif / total) * 100) || 1, color: CHART_COLORS.kharif },
      { name: t("season.rabi"), value: Math.round((rabi / total) * 100) || 1, color: CHART_COLORS.rabi },
      { name: t("season.zaid"), value: Math.round((zaid / total) * 100) || 1, color: CHART_COLORS.zaid },
    ];
  }, [charts?.yieldOverTime, t]);

  // Prepare market data
  const marketChartData = useMemo(() => {
    if (!charts?.marketPrices || charts.marketPrices.length === 0) return [];
    return charts.marketPrices;
  }, [charts?.marketPrices]);

  return (
    <div
      className="space-y-6 animate-fade-in min-h-screen"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "radial-gradient(circle at top, #f5f7f4 0%, #faf8f3 52%)",
      }}
    >
      {/* Page Header with Enhanced Styling */}
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Crimson Pro', serif",
              color: GREEN_PALETTE.forest,
            }}
          >
            {t("common.dashboard")}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {t("dashboard.overview")}
            {lastUpdated && (
              <span className="ml-2 text-xs text-slate-400">
                • {t("common.updated")} {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-green-200/60 rounded-xl px-4 py-2.5 shadow-sm">
            <Calendar className="h-4 w-4 text-green-700" />
            <span className="text-sm font-medium text-slate-700">
              {currentDate}
            </span>
          </div>
        </div>
      </div>

      {/* Backend Status */}
      {backendOk === false && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/80 backdrop-blur-sm p-4 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800 text-sm">
              {t("dashboard.backendNotReachable")}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {t("dashboard.startApi")}{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">
                cd backend-node && npm run dev
              </code>
            </p>
          </div>
        </div>
      )}
      {backendOk === true && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/80 backdrop-blur-sm p-3 shadow-sm">
          <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
          <span className="text-xs font-medium text-green-800">
            {t("dashboard.apiConnected")}
          </span>
        </div>
      )}

      {/* Action Bar with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:brightness-105"
          >
            <FileText className="h-4 w-4" />
            {t("reports.generateReport")}
          </Link>
          <Link
            to="/assistance"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:brightness-105"
          >
            <Bot className="h-4 w-4" />
            {t("common.assistance")}
          </Link>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-green-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-green-50 transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
            {t("common.refresh")}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-500">{t("dashboard.liveData")}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-white/60 backdrop-blur-sm border border-green-100/60 rounded-xl shadow-sm">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            {t("form.cropType")}
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">{t("dashboard.allCrops")}</option>
            <option value="Rice">Rice</option>
            <option value="Wheat">Wheat</option>
            <option value="Maize">Maize</option>
            <option value="Cotton">Cotton</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            {t("form.season")}
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">{t("dashboard.allSeasons")}</option>
            <option value="Kharif">{t("season.kharif")}</option>
            <option value="Rabi">{t("season.rabi")}</option>
            <option value="Zaid">{t("season.zaid")}</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            {t("form.location")}
          </label>
          <input
            type="text"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            placeholder={t("form.locationPlaceholder")}
            className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Metric Cards with Enhanced Design */}
      {loading ? (
        <section className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-green-100 bg-white p-5"
            >
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </section>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : metrics ? (
        <section className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t("dashboard.totalYield")}
            value={metrics.totalYield > 0 ? `${metrics.totalYield.toFixed(1)}t` : "0.0t"}
            trend={metrics.yieldTrend}
            trendLabel={metrics.yieldTrend > 0 ? "vs last season" : ""}
            icon={BarChart3}
            status={getMetricStatus(metrics.totalYield, { good: 10, warning: 5 })}
            subtitle={selectedCrop || "All crops"}
          />
          <MetricCard
            title={t("dashboard.waterEfficiency")}
            value={`${metrics.waterEfficiency.toFixed(0)}%`}
            trend={metrics.waterEfficiency > 75 ? 5.2 : -2.1}
            icon={Droplets}
            status={getMetricStatus(metrics.waterEfficiency, { good: 75, warning: 50 })}
            subtitle={`${metrics.waterUsage.toFixed(1)} ${t("common.liters")}/day`}
          />
          <MetricCard
            title={t("dashboard.weatherRisk")}
            value={`${metrics.weatherRisk.toFixed(0)}`}
            trend={metrics.weatherRisk < 50 ? -3.5 : 5.3}
            icon={Cloud}
            status={getMetricStatus(100 - metrics.weatherRisk, { good: 50, warning: 30 })}
            subtitle={
              weatherUnavailable
                ? t("dashboard.weatherUnavailable")
                : selectedLocation
                ? selectedLocation
                : t("dashboard.noLocation")
            }
          />
          <MetricCard
            title={t("dashboard.marketTrend")}
            value={`${metrics.marketTrend >= 0 ? "+" : ""}${metrics.marketTrend.toFixed(1)}%`}
            trend={Math.abs(metrics.marketTrend)}
            icon={TrendingUp}
            status={metrics.marketTrend > 0 ? "good" : "warning"}
            subtitle={t("dashboard.priceMovement")}
          />
        </section>
      ) : null}

      {/* Charts Section - Row 1: Yield Bar + Weather Area */}
      <section className="grid gap-6 grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <ChartCard
          title={t("dashboard.cropYieldPrediction")}
          subtitle={t("dashboard.tonnesPerAcre")}
          loading={loading}
          empty={!yieldChartData.length}
          emptyMessage={t("validation.noDataAvailable")}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={yieldChartData} barSize={24}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                opacity={0.5}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="Kharif"
                fill={CHART_COLORS.kharif}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="Rabi"
                fill={CHART_COLORS.rabi}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="Zaid"
                fill={CHART_COLORS.zaid}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t("dashboard.weatherForecastRisk")}
          subtitle={t("dashboard.sevenDayOutlook")}
          loading={loading}
          empty={!weatherChartData.length}
          emptyMessage={t("dashboard.weatherUnavailable")}
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weatherChartData}>
              <defs>
                <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.accent}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.accent}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="gRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#f59e0b"
                    stopOpacity={0.35}
                  />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                opacity={0.5}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke={CHART_COLORS.accent}
                fill="url(#gTemp)"
                strokeWidth={2.5}
                name="Temperature (°C)"
              />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="#f59e0b"
                fill="url(#gRisk)"
                strokeWidth={2.5}
                name="Risk Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Charts Section - Row 2: Soil Pie + Season Pie + Market Line */}
      <section className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_0.75fr_1fr]">
        <ChartCard
          title={t("dashboard.soilNutrientDistribution")}
          subtitle={t("dashboard.levelsVsOptimal")}
          loading={loading}
          empty={!soilChartData.length}
          emptyMessage={t("validation.noDataAvailable")}
        >
          <div className="flex items-center gap-4">
            <PieChart width={160} height={160}>
                <Pie
                  data={soilChartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={64}
                  paddingAngle={4}
                >
                  {soilChartData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status === "good"
                          ? CHART_COLORS.primary
                          : entry.status === "neutral"
                          ? CHART_COLORS.secondary
                          : "#f59e0b"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            <div className="flex flex-col gap-2 flex-1">
              {soilChartData.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{
                      background:
                        item.status === "good"
                          ? CHART_COLORS.primary
                          : item.status === "neutral"
                          ? CHART_COLORS.secondary
                          : "#f59e0b",
                    }}
                  />
                  <span className="text-xs text-slate-600 flex-1">
                    {item.name}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title={t("dashboard.seasonDistribution")}
          subtitle={t("dashboard.currentCropSeasons")}
          loading={loading}
          empty={!seasonData.length}
          emptyMessage={t("validation.noDataAvailable")}
        >
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={seasonData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={56}
                  label={({ name, value }) => `${value}%`}
                  labelLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                >
                  {seasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {seasonData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  <span className="text-xs text-slate-600">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title={t("dashboard.marketPriceTrends")}
          subtitle={t("dashboard.inrPerQuintal")}
          loading={loading}
          empty={!marketChartData.length}
          emptyMessage={t("validation.noDataAvailable")}
        >
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={marketChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={CHART_COLORS.primary}
                strokeWidth={2.5}
                dot={{ r: 4, fill: CHART_COLORS.primary }}
                name="Price (INR/Qtl)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Quick Access Modules */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/water" className="block">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-green-300 hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/30 border-green-100/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 shadow-sm">
                  <Droplets className="h-6 w-6" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {t("common.waterIrrigation")}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {t("water.subtitle")}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/crop" className="block">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-green-300 hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/30 border-green-100/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 shadow-sm">
                  <Sprout className="h-6 w-6" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {t("common.cropRecommendation")}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {t("crop.subtitle")}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/yield" className="block">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-green-300 hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/30 border-green-100/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {t("common.yieldPest")}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {t("yield.subtitle")}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/market" className="block">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-green-300 hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/30 border-green-100/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 shadow-sm">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {t("common.marketPrices")}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {t("market.subtitle")}
              </p>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
};
