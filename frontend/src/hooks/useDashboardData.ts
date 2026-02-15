import { useState, useEffect } from "react";
import { api, yieldApi, irrigationApi, weatherApi, marketApi } from "../lib/api";
import type { YieldPredictResponse, IrrigationPredictResponse, WeatherResponse, MarketPricesResponse } from "../lib/api";

export interface DashboardMetrics {
  totalYield: number;
  yieldTrend: number;
  waterUsage: number;
  waterEfficiency: number;
  weatherRisk: number;
  pestRisk: "Low" | "Medium" | "High";
  soilHealth: number;
  marketTrend: number;
}

export interface DashboardChartData {
  yieldOverTime: Array<{ month: string; value: number; season: string }>;
  weatherForecast: Array<{ day: string; temp: number; humidity: number; risk: number }>;
  soilNutrients: Array<{ name: string; value: number; optimal: number }>;
  marketPrices: Array<{ date: string; crop: string; price: number }>;
  cropDistribution: Array<{ crop: string; percentage: number }>;
}

interface DashboardData {
  metrics: DashboardMetrics | null;
  charts: DashboardChartData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  weatherUnavailable: boolean;
}

/**
 * Backend supports both "City, State" and state-only (uses state capital fallback).
 * Only skip for clearly invalid inputs (too short or no letters).
 */
function shouldFetchWeather(location: string): boolean {
  const trimmed = location.trim();
  if (trimmed.length < 3) return false;
  return /[a-zA-Z\u0900-\u097F]/.test(trimmed);
}

export function useDashboardData(
  cropType?: string,
  season?: string,
  location?: string
): DashboardData {
  const [data, setData] = useState<DashboardData>({
    metrics: null,
    charts: null,
    loading: true,
    error: null,
    lastUpdated: null,
    weatherUnavailable: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboardData() {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Get recent data from localStorage first (quick load)
        const recentYield = localStorage.getItem("recent-yield");
        const recentIrrigation = localStorage.getItem("recent-irrigation");
        const recentCrop = localStorage.getItem("recent-crop");

        // Parse existing data
        let yieldData: YieldPredictResponse | null = null;
        let irrigationData: IrrigationPredictResponse | null = null;
        let weatherData: WeatherResponse | null = null;
        let marketData: MarketPricesResponse | null = null;

        if (recentYield) {
          try {
            yieldData = JSON.parse(recentYield);
          } catch {}
        }

        if (recentIrrigation) {
          try {
            irrigationData = JSON.parse(recentIrrigation);
          } catch {}
        }

        // Fetch weather when location is valid (backend handles "City, State" and state-only)
        let weatherUnavailable = false;
        if (location?.trim() && shouldFetchWeather(location)) {
          try {
            weatherData = await weatherApi.get(location.trim());
          } catch {
            weatherUnavailable = true;
          }
        }

        // Fetch market prices
        try {
          marketData = await marketApi.getPrices({ crop: cropType });
        } catch (err) {
          console.warn("Market prices fetch failed:", err);
        }

        if (cancelled) return;

        // Calculate metrics
        const metrics: DashboardMetrics = {
          totalYield: yieldData?.predictedYield || 0,
          yieldTrend: yieldData?.predictedYield ? 8.5 : 0,
          waterUsage: irrigationData?.dailyWater || 0,
          waterEfficiency: irrigationData?.efficiencyScore || 0,
          weatherRisk: weatherData
            ? calculateWeatherRisk(weatherData.temperatureC, weatherData.humidity)
            : 62,
          pestRisk: yieldData?.riskLevel || "Medium",
          soilHealth: 75, // Default, can be enhanced with soil API
          marketTrend: calculateMarketTrend(marketData),
        };

        // Generate chart data
        const charts: DashboardChartData = {
          yieldOverTime: generateYieldOverTime(yieldData, season),
          weatherForecast: generateWeatherForecast(weatherData),
          soilNutrients: generateSoilNutrients(),
          marketPrices: generateMarketPrices(marketData, cropType),
          cropDistribution: generateCropDistribution(recentCrop, cropType),
        };

        setData({
          metrics,
          charts,
          loading: false,
          error: null,
          lastUpdated: new Date(),
          weatherUnavailable,
        });
      } catch (error) {
        if (cancelled) return;
        setData({
          metrics: null,
          charts: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load dashboard data",
          lastUpdated: null,
          weatherUnavailable: false,
        });
      }
    }

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [cropType, season, location]);

  return data;
}

function calculateWeatherRisk(temp: number, humidity: number): number {
  // Risk increases with extreme temps or high humidity
  let risk = 50;
  if (temp > 35) risk += (temp - 35) * 2;
  if (temp < 15) risk += (15 - temp) * 1.5;
  if (humidity > 80) risk += (humidity - 80) * 0.5;
  return Math.min(100, Math.max(0, risk));
}

function calculateMarketTrend(marketData: MarketPricesResponse | null): number {
  if (!marketData?.prices || marketData.prices.length < 2) return 0;
  const prices = marketData.prices
    .map((p) => p.modalPrice || p.maxPrice || p.minPrice || 0)
    .filter((p) => p > 0);
  if (prices.length < 2) return 0;
  const first = prices[0];
  const last = prices[prices.length - 1];
  return ((last - first) / first) * 100;
}

// Indian cropping seasons: Kharif (Jun-Oct), Rabi (Nov-Mar), Zaid (Apr-Jun)
const KHARIF_MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct"];
const RABI_MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar"];
const ZAID_MONTHS = ["Apr", "May", "Jun"];

function getSeasonForMonth(month: string): "Kharif" | "Rabi" | "Zaid" | null {
  if (KHARIF_MONTHS.includes(month)) return "Kharif";
  if (RABI_MONTHS.includes(month)) return "Rabi";
  if (ZAID_MONTHS.includes(month)) return "Zaid";
  return null;
}

function generateYieldOverTime(
  yieldData: YieldPredictResponse | null,
  season?: string
): Array<{ month: string; value: number; season: string }> {
  const months = [...KHARIF_MONTHS, ...RABI_MONTHS, ...ZAID_MONTHS];
  const uniqueMonths = [...new Set(months)];
  const baseYield = yieldData?.predictedYield || 0;

  let seed = baseYield;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  return uniqueMonths.map((month) => {
    const monthSeason = getSeasonForMonth(month);
    const isKharif = monthSeason === "Kharif";
    const isRabi = monthSeason === "Rabi";
    const isZaid = monthSeason === "Zaid";

    let value = 0;
    if (season === "Kharif" && isKharif) {
      value = baseYield > 0 ? baseYield * (0.8 + seededRandom() * 0.4) : 3.5 + seededRandom() * 1.5;
    } else if (season === "Rabi" && isRabi) {
      value = baseYield > 0 ? baseYield * (0.75 + seededRandom() * 0.5) : 3.0 + seededRandom() * 1.2;
    } else if (season === "Zaid" && isZaid) {
      value = baseYield > 0 ? baseYield * (0.7 + seededRandom() * 0.5) : 2.5 + seededRandom() * 1.0;
    } else if (!season) {
      if (isKharif) {
        value = baseYield > 0 ? baseYield * (0.7 + seededRandom() * 0.6) : 3.5 + seededRandom() * 1.5;
      } else if (isRabi) {
        value = baseYield > 0 ? baseYield * (0.65 + seededRandom() * 0.7) : 3.0 + seededRandom() * 1.2;
      } else if (isZaid) {
        value = baseYield > 0 ? baseYield * (0.6 + seededRandom() * 0.6) : 2.5 + seededRandom() * 1.0;
      }
    }

    return {
      month,
      value: Number(value.toFixed(1)),
      season: monthSeason || "Off-season",
    };
  });
}

function generateWeatherForecast(
  weather: WeatherResponse | null
): Array<{ day: string; temp: number; humidity: number; risk: number }> {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const baseTemp = weather?.temperatureC || 28;
  const baseHumidity = weather?.humidity || 65;

  // Use seeded random for consistency
  let seed = baseTemp * 100 + baseHumidity;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  return days.map((day) => {
    const temp = baseTemp + (seededRandom() - 0.5) * 8;
    const humidity = Math.max(30, Math.min(95, baseHumidity + (seededRandom() - 0.5) * 20));
    const risk = calculateWeatherRisk(temp, humidity);
    
    return {
      day,
      temp: Number(temp.toFixed(1)),
      humidity: Number(humidity.toFixed(0)),
      risk: Number(risk.toFixed(0)),
    };
  });
}

function generateSoilNutrients(): Array<{ name: string; value: number; optimal: number }> {
  return [
    { name: "Nitrogen", value: 38, optimal: 40 },
    { name: "Phosphorus", value: 24, optimal: 25 },
    { name: "Potassium", value: 20, optimal: 22 },
    { name: "Organic Matter", value: 12, optimal: 15 },
    { name: "Moisture", value: 6, optimal: 8 },
  ];
}

function generateMarketPrices(
  marketData: MarketPricesResponse | null,
  cropType?: string
): Array<{ date: string; crop: string; price: number }> {
  if (!marketData?.prices || marketData.prices.length === 0) {
    // Fallback data
    const dates = ["Jan 20", "Jan 27", "Feb 03"];
    return dates.map((date) => ({
      date,
      crop: cropType || "Rice",
      price: 2100 + Math.random() * 200,
    }));
  }

  return marketData.prices.slice(0, 10).map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    crop: p.commodity,
    price: p.modalPrice || p.maxPrice || p.minPrice || 0,
  }));
}

function generateCropDistribution(
  recentCrop: string | null,
  cropType?: string
): Array<{ crop: string; percentage: number }> {
  let selectedCrop: string | null = cropType || null;
  if (!selectedCrop && recentCrop) {
    try {
      const parsed = JSON.parse(recentCrop);
      selectedCrop = parsed?.selectedCrop || null;
    } catch {
      selectedCrop = null;
    }
  }

  if (selectedCrop) {
    return [{ crop: selectedCrop, percentage: 100 }];
  }

  // Default distribution - Kharif/Rabi/Zaid crops only (no Sugarcane)
  return [
    { crop: "Rice", percentage: 35 },
    { crop: "Wheat", percentage: 30 },
    { crop: "Cotton", percentage: 20 },
    { crop: "Other", percentage: 15 },
  ];
}
