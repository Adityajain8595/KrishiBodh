/**
 * Yield prediction using crop, stage, soil, irrigation, and real weather when location given.
 * Rule-based baseline; deterministic. Assumptions stated in response.
 */

const weatherService = require('./weather.service');

const BASE_YIELD_T_HA = {
  Wheat: { seedling: 0, vegetative: 1.2, flowering: 2.5, fruiting: 3.2, maturity: 4 },
  Maize: { seedling: 0, vegetative: 1.5, flowering: 3.5, fruiting: 5, maturity: 6 },
  Rice: { seedling: 0, vegetative: 1.8, flowering: 3.2, fruiting: 4.5, maturity: 5.2 },
  Cotton: { seedling: 0, vegetative: 0.8, flowering: 1.5, fruiting: 2.2, maturity: 2.8 },
  Soybean: { seedling: 0, vegetative: 1, flowering: 1.8, fruiting: 2.2, maturity: 2.5 },
  Sugarcane: { seedling: 0, vegetative: 25, flowering: 55, fruiting: 75, maturity: 85 },
  Barley: { seedling: 0, vegetative: 1, flowering: 2.2, fruiting: 2.8, maturity: 3.5 },
  Mustard: { seedling: 0, vegetative: 0.4, flowering: 0.8, fruiting: 1.1, maturity: 1.3 },
  Chickpea: { seedling: 0, vegetative: 0.5, flowering: 1.2, fruiting: 1.6, maturity: 2 },
  Lentil: { seedling: 0, vegetative: 0.3, flowering: 0.6, fruiting: 0.8, maturity: 1 },
  Potato: { seedling: 0, vegetative: 8, flowering: 18, fruiting: 25, maturity: 28 },
  Onion: { seedling: 0, vegetative: 5, flowering: 12, fruiting: 18, maturity: 20 },
  Tomato: { seedling: 0, vegetative: 8, flowering: 20, fruiting: 35, maturity: 40 },
  Groundnut: { seedling: 0, vegetative: 0.6, flowering: 1.2, fruiting: 1.6, maturity: 1.8 },
  'Pearl Millet': { seedling: 0, vegetative: 0.8, flowering: 1.5, fruiting: 2, maturity: 2.2 },
  'Pigeon Pea': { seedling: 0, vegetative: 0.5, flowering: 1, fruiting: 1.3, maturity: 1.5 },
  Cucumber: { seedling: 0, vegetative: 15, flowering: 25, fruiting: 30, maturity: 35 },
  Watermelon: { seedling: 0, vegetative: 20, flowering: 30, fruiting: 35, maturity: 40 },
  Muskmelon: { seedling: 0, vegetative: 15, flowering: 22, fruiting: 28, maturity: 30 },
  'Bitter Gourd': { seedling: 0, vegetative: 10, flowering: 18, fruiting: 22, maturity: 25 },
  Pumpkin: { seedling: 0, vegetative: 15, flowering: 25, fruiting: 28, maturity: 30 },
};

const SOIL_FACTOR = {
  Loam: 1,
  Clay: 0.95,
  'Clay-loam': 1.02,
  Silt: 1.05,
  Sandy: 0.88,
};

const IRRIGATION_FACTOR = {
  Drip: 1.08,
  Subsurface: 1.05,
  Pivot: 1.02,
  Sprinkler: 1,
  Flood: 0.92,
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

/**
 * Weather impact factor from real data. Temp stress or dry conditions reduce yield.
 * Deterministic: same weather -> same factor.
 */
function weatherImpactFactor(tempC, precipitationMm) {
  let f = 1;
  if (typeof tempC === 'number') {
    if (tempC > 38) f *= 0.92;
    else if (tempC > 35) f *= 0.96;
    else if (tempC < 5) f *= 0.9;
  }
  if (typeof precipitationMm === 'number') {
    if (precipitationMm < 0.5 && (tempC == null || tempC > 28)) f *= 0.95;
  }
  return Math.round(f * 100) / 100;
}

function predictYieldTHa(cropType, variety, growthStage, soilType, irrigationType, weatherFactor = 1) {
  const crop = BASE_YIELD_T_HA[cropType] || BASE_YIELD_T_HA.Wheat;
  const stage = normalizeStage(growthStage);
  const base = crop[stage] ?? crop.vegetative;
  const soilF = SOIL_FACTOR[soilType] || 1;
  const irrF = IRRIGATION_FACTOR[irrigationType] || 1;
  const varietyBonus = variety && String(variety).trim().length > 0 ? 1.02 : 1;
  const predicted = base * soilF * irrF * varietyBonus * weatherFactor;
  return Math.round(predicted * 100) / 100;
}

function riskLevel(growthStage, irrigationType) {
  const stage = normalizeStage(growthStage);
  if (stage === 'seedling' || stage === 'flowering') return 'Medium';
  if ((IRRIGATION_FACTOR[irrigationType] || 1) < 1) return 'Medium';
  return 'Low';
}

function buildRecommendations(cropType, growthStage, risk) {
  const recs = [];
  if (risk === 'Medium') recs.push('Monitor soil moisture and pest pressure; consider preventive sprays at flowering.');
  recs.push(`${cropType} at ${growthStage}: ensure nutrient schedule and irrigation are on plan.`);
  recs.push('Final yield depends on weather and management; use local historical averages for planning.');
  return recs;
}

function confidence(cropType, growthStage, soilType, irrigationType, hasWeather) {
  const known = [cropType, growthStage, soilType, irrigationType].filter(Boolean).length;
  let c = 0.7 + (known / 4) * 0.2;
  if (hasWeather) c += 0.05;
  return Math.min(0.95, Math.round(c * 100) / 100);
}

function buildAssumptions(location, weather) {
  const assumptions = [
    'Yield is estimated from crop growth stage, soil type, and irrigation method (rule-based).',
    'Base yield per stage is derived from Indian average ranges for the crop.',
  ];
  if (location && String(location).trim()) {
    if (weather) assumptions.push(`Weather at ${weather.city || location} is used to adjust yield.`);
    else assumptions.push('Location provided but weather could not be fetched; no weather adjustment applied.');
  } else {
    assumptions.push('No location provided; weather impact not applied.');
  }
  return assumptions;
}

async function predictYield(payload) {
  const { cropType, variety, farmSize, growthStage, soilType, irrigationType, location } = payload;
  const farmSizeNum = Number(farmSize) || 1;

  let weather = null;
  if (location && String(location).trim()) {
    try {
      weather = await weatherService.getWeatherForLocation(String(location).trim());
    } catch (_) {}
  }
  const tempC = weather && typeof weather.temperatureC === 'number' ? weather.temperatureC : null;
  const precipitationMm = weather && typeof weather.precipitationMm === 'number' ? weather.precipitationMm : null;
  const weatherFactor = weatherImpactFactor(tempC, precipitationMm);

  const yieldPerHa = predictYieldTHa(cropType, variety, growthStage, soilType, irrigationType, weatherFactor);
  const totalYield = Math.round(yieldPerHa * farmSizeNum * 100) / 100;
  const risk = riskLevel(growthStage, irrigationType);
  const recommendations = buildRecommendations(cropType, growthStage, risk);
  const conf = confidence(cropType, growthStage, soilType, irrigationType, !!weather);
  const assumptions = buildAssumptions(location, weather);

  const out = {
    predictedYield: totalYield,
    yieldPerAcre: Math.round((yieldPerHa / 2.471) * 100) / 100,
    confidence: conf,
    riskLevel: risk,
    recommendations,
    assumptions,
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
  predictYield,
};

