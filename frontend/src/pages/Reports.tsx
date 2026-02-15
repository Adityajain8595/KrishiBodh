import React, { useState, useMemo, useRef, useEffect } from "react";
import { Calendar, Download, Printer, FileText, TrendingUp, Droplets, Sprout, Activity, BarChart3, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { useTranslation } from "../lib/translations";
import { useLanguage } from "../contexts/LanguageContext";

interface ReportData {
  dateRange: { start: string; end: string };
  kpis: {
    totalYield: number;
    growthPercent: number;
    waterUsage: number;
    healthScore: number;
  };
  yieldTrends: Array<{ date: string; yield: number }>;
  cropDistribution: Array<{ crop: string; percentage: number }>;
  insights: Array<{ type: "positive" | "warning" | "info"; text: string }>;
}

function useReportData(startDate: string, endDate: string, isHindi: boolean): ReportData | null {
  return useMemo(() => {
    try {
      const recentYield = localStorage.getItem("recent-yield");
      const recentIrrigation = localStorage.getItem("recent-irrigation");
      const recentCrop = localStorage.getItem("recent-crop");

      let totalYield = 0;
      let waterUsage = 0;
      let healthScore = 75;
      const cropDistribution: Array<{ crop: string; percentage: number }> = [];
      const insights: Array<{ type: "positive" | "warning" | "info"; text: string }> = [];

      if (recentYield) {
        const yieldData = JSON.parse(recentYield);
        totalYield = yieldData.predictedYield || 0;
        healthScore = yieldData.riskLevel === "Low" ? 85 : yieldData.riskLevel === "Medium" ? 70 : 55;
        
        if (yieldData.riskLevel === "Low") {
          insights.push({ type: "positive", text: isHindi ? "उपज जोखिम कम है। कटाई के लिए अच्छी स्थितियां।" : "Yield risk is low. Good conditions for harvest." });
        } else if (yieldData.riskLevel === "High") {
          insights.push({ type: "warning", text: isHindi ? "उच्च उपज जोखिम का पता चला। सिंचाई और कीट प्रबंधन की समीक्षा करें।" : "High yield risk detected. Review irrigation and pest management." });
        }
      }

      if (recentIrrigation) {
        const irrigationData = JSON.parse(recentIrrigation);
        waterUsage = irrigationData.dailyWater || 0;
        
        if (irrigationData.efficiencyScore > 80) {
          insights.push({ type: "positive", text: isHindi ? "उत्कृष्ट सिंचाई दक्षता। पानी का उपयोग इष्टतम है।" : "Excellent irrigation efficiency. Water usage is optimal." });
        } else if (irrigationData.efficiencyScore < 60) {
          insights.push({ type: "warning", text: isHindi ? "सिंचाई दक्षता में सुधार किया जा सकता है। पानी के उपयोग को अनुकूलित करने पर विचार करें।" : "Irrigation efficiency can be improved. Consider optimizing water usage." });
        }
      }

      if (recentCrop) {
        const cropData = JSON.parse(recentCrop);
        if (cropData.selectedCrop) {
          cropDistribution.push({ crop: cropData.selectedCrop, percentage: 100 });
        }
      }

      const growthPercent = totalYield > 0 ? Math.min(25, Math.max(-5, (totalYield / 100) * 2)) : 0;

      // Generate mock yield trends (last 7 days)
      const yieldTrends: Array<{ date: string; yield: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        yieldTrends.push({
          date: date.toISOString().split("T")[0],
          yield: totalYield > 0 ? totalYield * (0.9 + Math.random() * 0.2) : 0,
        });
      }

      if (insights.length === 0) {
        insights.push({ type: "info", text: isHindi ? "व्यापक रिपोर्ट के लिए डेटा उत्पन्न करने के लिए मॉड्यूल का उपयोग करें।" : "Use the modules to generate data for comprehensive reports." });
      }

      return {
        dateRange: { start: startDate, end: endDate },
        kpis: {
          totalYield,
          growthPercent,
          waterUsage,
          healthScore,
        },
        yieldTrends,
        cropDistribution,
        insights,
      };
    } catch {
      return null;
    }
  }, [startDate, endDate, isHindi]);
}

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const reportData = useReportData(startDate, endDate, isHindi);

  // Store report generation data in sessionStorage
  useEffect(() => {
    if (reportData) {
      sessionStorage.setItem("report-generation-data", JSON.stringify({
        dateRange: reportData.dateRange,
        season: localStorage.getItem("selected-season") || "Rabi",
        language: isHindi ? "hi" : "en",
        timestamp: new Date().toISOString(),
      }));
    }
  }, [reportData, isHindi]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setGenerating(true);
    try {
      // Try to use html2pdf library if available, otherwise fallback to print
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        const opt = {
          margin: 1,
          filename: `Krishibodh_Report_${startDate}_${endDate}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };
        await html2pdf().set(opt).from(reportRef.current).save();
      } else {
        // Fallback to print
        window.print();
      }
    } catch (error) {
      console.error("PDF generation failed, using print fallback:", error);
      window.print();
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Always show report, even with placeholder data
  const hasData = reportData !== null;
  const displayData = reportData || {
    dateRange: { start: startDate, end: endDate },
    kpis: {
      totalYield: 0,
      growthPercent: 0,
      waterUsage: 0,
      healthScore: 75,
    },
    yieldTrends: [],
    cropDistribution: [],
    insights: [{ type: "info" as const, text: isHindi ? "रिपोर्ट उत्पन्न करने के लिए कृपया पहले सिंचाई, फसल, या उपज मॉड्यूल का उपयोग करें।" : "Please use the irrigation, crop, or yield modules first to generate data for reports." }],
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-surface-900">{t("reports.title")}</h1>
          <p className="mt-1 text-base text-surface-500">{t("reports.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2">
            <Calendar className="h-4 w-4 text-surface-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm border-0 focus:outline-none"
              max={endDate}
            />
            <span className="text-surface-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm border-0 focus:outline-none"
              min={startDate}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {generating ? t("reports.generating") : t("reports.download")}
          </button>
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <Printer className="h-4 w-4" />
            {t("reports.print")}
          </button>
        </div>
      </div>

      {/* Report Content - Always visible */}
      {hasData && (
        <div ref={reportRef} className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="print:mb-4">
            <h1 className="text-3xl font-bold text-surface-900 mb-2">Krishibodh</h1>
            <h2 className="text-xl font-semibold text-surface-700">{t("reports.title")}</h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-surface-500">
                {t("reports.dateRange")}: {new Date(displayData.dateRange.start).toLocaleDateString()} - {new Date(displayData.dateRange.end).toLocaleDateString()}
              </p>
              {(() => {
                const season = sessionStorage.getItem("selected-season") || localStorage.getItem("selected-season") || null;
                if (season) {
                  return (
                    <span className="text-sm font-medium text-surface-600">
                      {t("common.season")}: {t(`season.${season.toLowerCase()}` as any) || season}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* KPI Summary */}
          <Card>
            <CardHeader title={t("reports.kpiSummary")} />
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-600">{isHindi ? "कुल उपज" : "Total Yield"}</span>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-surface-900">
                    {displayData.kpis.totalYield > 0 ? displayData.kpis.totalYield.toFixed(1) : "0.0"} {isHindi ? "किग्रा" : "kg"}
                  </p>
                  {displayData.kpis.growthPercent !== 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {displayData.kpis.growthPercent > 0 ? "+" : ""}
                      {displayData.kpis.growthPercent.toFixed(1)}% {isHindi ? "वृद्धि" : "growth"}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-600">{isHindi ? "स्वास्थ्य स्कोर" : "Health Score"}</span>
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-surface-900">{displayData.kpis.healthScore}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-surface-200">
                    <div
                      className={`h-full ${
                        displayData.kpis.healthScore >= 75 ? "bg-green-500" : displayData.kpis.healthScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${displayData.kpis.healthScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-600">{isHindi ? "पानी का उपयोग" : "Water Usage"}</span>
                    <Droplets className="h-5 w-5 text-cyan-600" />
                  </div>
                  <p className="text-2xl font-bold text-surface-900">
                    {displayData.kpis.waterUsage > 0 ? displayData.kpis.waterUsage.toFixed(1) : "0.0"} {isHindi ? "लीटर/दिन" : "L/day"}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-600">{isHindi ? "फसल वितरण" : "Crop Distribution"}</span>
                    <Sprout className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-surface-900">
                    {displayData.cropDistribution.length > 0 ? displayData.cropDistribution[0].crop : isHindi ? "कोई डेटा नहीं" : "No Data"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yield Trends */}
          {displayData.yieldTrends.length > 0 && (
            <Card>
              <CardHeader title={t("reports.yieldTrends")} />
              <CardContent>
                <div className="space-y-2">
                  {displayData.yieldTrends.map((trend, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-50">
                      <span className="text-sm text-surface-600">{new Date(trend.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 rounded-full bg-surface-200 overflow-hidden">
                          <div
                            className="h-full bg-primary-600 transition-all"
                            style={{ width: `${Math.min(100, (trend.yield / (displayData.kpis.totalYield || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-surface-900 w-20 text-right">
                          {trend.yield.toFixed(1)} {isHindi ? "किग्रा" : "kg"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          {displayData.insights.length > 0 && (
            <Card>
              <CardHeader title={t("reports.insights")} />
              <CardContent>
                <div className="space-y-3">
                  {displayData.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        insight.type === "positive"
                          ? "bg-green-50 border-green-200"
                          : insight.type === "warning"
                          ? "bg-amber-50 border-amber-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      {insight.type === "positive" ? (
                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      ) : insight.type === "warning" ? (
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <BarChart3 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-surface-700 flex-1">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-surface-500 py-4 border-t border-surface-200 print:mt-8">
            <p>Krishibodh - {isHindi ? "कृषि निर्णय सहायता प्रणाली" : "Agricultural Decision Support System"}</p>
            <p className="mt-1">{new Date().toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};
