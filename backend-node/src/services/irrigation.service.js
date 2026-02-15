/**
 * Water usage and irrigation optimization. Rule-based formulas.
 * Uses real weather (Open-Meteo) when location is provided. Deterministic.
 */

const weatherService = require('./weather.service');

const CROP_BASE_MM = {
  Wheat: { seedling: 2.5, vegetative: 4.5, flowering: 6, fruiting: 5.5, maturity: 3 },
  Maize: { seedling: 2, vegetative: 5, flowering: 7, fruiting: 6.5, maturity: 4 },
  Rice: { seedling: 4, vegetative: 6, flowering: 8, fruiting: 7, maturity: 5 },
  Cotton: { seedling: 2, vegetative: 5, flowering: 6.5, fruiting: 6, maturity: 4 },
  Soybean: { seedling: 2.5, vegetative: 4.5, flowering: 5.5, fruiting: 5, maturity: 3 },
  Sugarcane: { seedling: 3, vegetative: 6, flowering: 7, fruiting: 6.5, maturity: 5 },
  Barley: { seedling: 2, vegetative: 4, flowering: 5.5, fruiting: 5, maturity: 2.5 },
  Mustard: { seedling: 2, vegetative: 3.5, flowering: 5, fruiting: 4.5, maturity: 2.5 },
  Chickpea: { seedling: 2, vegetative: 4, flowering: 5, fruiting: 4.5, maturity: 2.5 },
  Lentil: { seedling: 1.5, vegetative: 3.5, flowering: 4.5, fruiting: 4, maturity: 2 },
  Potato: { seedling: 2.5, vegetative: 5, flowering: 6, fruiting: 5.5, maturity: 4 },
  Onion: { seedling: 2, vegetative: 4, flowering: 5, fruiting: 4.5, maturity: 3 },
  Tomato: { seedling: 2.5, vegetative: 4.5, flowering: 6, fruiting: 5.5, maturity: 4 },
  Groundnut: { seedling: 2, vegetative: 4.5, flowering: 5.5, fruiting: 5, maturity: 3 },
  'Pearl Millet': { seedling: 2, vegetative: 4, flowering: 5.5, fruiting: 5, maturity: 3 },
  'Pigeon Pea': { seedling: 2, vegetative: 4, flowering: 5.5, fruiting: 5, maturity: 3 },
};

const IRRIGATION_EFFICIENCY = {
  Drip: 0.92,
  Subsurface: 0.88,
  Pivot: 0.82,
  Sprinkler: 0.75,
  Flood: 0.55,
};

const SOIL_RETENTION = {
  Clay: 1.15,
  'Clay-loam': 1.05,
  Loam: 1,
  Silt: 0.95,
  Sandy: 0.85,
};

function normalizeStage(stage) {
  const s = (stage || '').toLowerCase();
  if (s.includes('seedling')) return 'seedling';
  if (s.includes('vegetative')) return 'vegetative';
  if (s.includes('flower')) return 'flowering';
  if (s.includes('fruit')) return 'fruiting';
  if (s.includes('matur')) return 'maturity';
  return 'vegetative';
}

function getBaseMmPerDay(cropType, growthStage) {
  const crop = CROP_BASE_MM[cropType] || CROP_BASE_MM.Wheat;
  const stage = normalizeStage(growthStage);
  return crop[stage] ?? crop.vegetative;
}

/**
 * Rule-based daily water (mm). Same inputs always give same output.
 * If weather precipitation > 0, effective irrigation need is reduced (rain supplements).
 */
function computeDailyWaterMm(location, farmSize, cropType, growthStage, soilType, irrigationType, precipitationMm = 0) {
  const baseMm = getBaseMmPerDay(cropType, growthStage);
  const soilFactor = SOIL_RETENTION[soilType] || SOIL_RETENTION.Loam;
  const eff = IRRIGATION_EFFICIENCY[irrigationType] || IRRIGATION_EFFICIENCY.Sprinkler;
  let needMm = (baseMm * soilFactor) / eff;
  if (precipitationMm > 0) {
    const rainUseful = Math.min(precipitationMm * 0.7, needMm * 0.5);
    needMm = Math.max(0, needMm - rainUseful);
  }
  return Math.round(needMm * 10) / 10;
}

function computeEfficiencyScore(irrigationType, soilType) {
  const eff = IRRIGATION_EFFICIENCY[irrigationType] || 0.75;
  const soil = SOIL_RETENTION[soilType] || 1;
  const raw = Math.min(100, (eff * 85) + (soil > 1 ? 5 : 0));
  return Math.round(raw);
}

function computeRiskLevel(dailyWaterMm, cropType, growthStage) {
  const base = getBaseMmPerDay(cropType, growthStage);
  const ratio = dailyWaterMm / (base * 1.2);
  if (ratio > 1.25) return 'High';
  if (ratio < 0.75) return 'High';
  if (ratio > 1.1 || ratio < 0.9) return 'Medium';
  return 'Low';
}

function buildSchedule(cropType, growthStage, irrigationType) {
  const slots = irrigationType === 'Drip' || irrigationType === 'Subsurface' ? 2 : 3;
  const duration = irrigationType === 'Flood' ? '3-4h' : '2h';
  return `Apply ${slots} times per day, ${duration} per slot. Morning and evening preferred for ${cropType} at ${growthStage}.`;
}

function buildRecommendations(location, riskLevel, irrigationType, soilType) {
  const recs = [];
  if (riskLevel === 'High') recs.push('Adjust application rate; check soil moisture and weather forecast.');
  if (irrigationType === 'Flood') recs.push('Consider drip or sprinkler for better efficiency and water savings.');
  recs.push(`Schedule aligned to typical conditions for ${location}. Verify with local soil moisture if available.`);
  if (soilType === 'Sandy') recs.push('Sandy soil requires more frequent, shorter applications to reduce leaching.');
  return recs;
}

function confidence(location, farmSize, cropType, growthStage, soilType, irrigationType, hasWeather) {
  const known = [location, cropType, growthStage, soilType, irrigationType].filter(Boolean).length;
  const hasSize = typeof farmSize === 'number' && farmSize > 0;
  let c = 0.7 + (known / 5) * 0.15 + (hasSize ? 0.05 : 0);
  if (hasWeather) c += 0.05;
  return Math.min(0.95, Math.round(c * 100) / 100);
}

async function predictIrrigation(payload) {
  const { location, farmSize, cropType, growthStage, soilType, irrigationType } = payload;
  const farmSizeNum = Number(farmSize) || 1;

  let weather = null;
  let precipitationMm = 0;
  if (location && String(location).trim()) {
    try {
      weather = await weatherService.getWeatherForLocation(String(location).trim());
      if (weather && typeof weather.precipitationMm === 'number') precipitationMm = weather.precipitationMm;
    } catch (_) {}
  }

  const dailyMm = computeDailyWaterMm(location, farmSizeNum, cropType, growthStage, soilType, irrigationType, precipitationMm);
  const weeklyMm = Math.round(dailyMm * 7 * 10) / 10;
  const dailyWaterKl = Math.round((dailyMm / 1000) * farmSizeNum * 10000 * 10) / 10;
  const weeklyWaterKl = Math.round(dailyWaterKl * 7 * 10) / 10;

  const efficiencyScore = computeEfficiencyScore(irrigationType, soilType);
  const riskLevel = computeRiskLevel(dailyMm, cropType, growthStage);
  const irrigationSchedule = buildSchedule(cropType, growthStage, irrigationType);
  const recommendations = buildRecommendations(location, riskLevel, irrigationType, soilType);
  const conf = confidence(location, farmSizeNum, cropType, growthStage, soilType, irrigationType, !!weather);

  const out = {
    dailyWater: Math.round(dailyWaterKl * 100) / 100,
    weeklyWater: Math.round(weeklyWaterKl * 100) / 100,
    irrigationSchedule,
    efficiencyScore,
    riskLevel,
    recommendations,
    confidence: conf,
  };

  if (weather) {
    out.weather = {
      city: weather.city,
      state: weather.state,
      temperatureC: weather.temperatureC,
      humidity: weather.humidity,
      precipitationMm: weather.precipitationMm,
    };
  }

  return out;
}

module.exports = {
  predictIrrigation,
};

