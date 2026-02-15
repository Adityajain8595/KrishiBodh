/**
 * Crop recommendation by location, soil, season, and real weather.
 * Rule-based suitability; weather compatibility from Open-Meteo. Deterministic.
 */

const weatherService = require('./weather.service');

const SEASON_CROPS = {
  Rabi: ['Wheat', 'Barley', 'Mustard', 'Chickpea', 'Lentil', 'Pea', 'Garlic', 'Onion', 'Potato'],
  Kharif: ['Rice', 'Maize', 'Cotton', 'Soybean', 'Sugarcane', 'Pearl Millet', 'Groundnut', 'Pigeon Pea', 'Tomato'],
  Zaid: ['Cucumber', 'Watermelon', 'Muskmelon', 'Bitter Gourd', 'Pumpkin'],
  'Year-round': ['Wheat', 'Rice', 'Maize', 'Soybean', 'Chickpea', 'Mustard', 'Potato', 'Onion', 'Tomato'],
};

const SOIL_SUITABILITY = {
  Loam: { Wheat: 0.95, Barley: 0.9, Mustard: 0.88, Chickpea: 0.9, Lentil: 0.85, Rice: 0.82, Maize: 0.9, Cotton: 0.85, Soybean: 0.9, Sugarcane: 0.8, Potato: 0.9, Onion: 0.88, Tomato: 0.9, 'Pearl Millet': 0.85, Groundnut: 0.88, 'Pigeon Pea': 0.85, Pea: 0.9, Garlic: 0.88, Cucumber: 0.9, Watermelon: 0.88, Muskmelon: 0.88, 'Bitter Gourd': 0.85, Pumpkin: 0.9 },
  Clay: { Wheat: 0.85, Barley: 0.82, Mustard: 0.9, Chickpea: 0.88, Lentil: 0.8, Rice: 0.95, Maize: 0.75, Cotton: 0.9, Soybean: 0.8, Sugarcane: 0.85, Potato: 0.88, Onion: 0.85, Tomato: 0.82, 'Pearl Millet': 0.75, Groundnut: 0.8, 'Pigeon Pea': 0.82, Pea: 0.88, Garlic: 0.85, Cucumber: 0.82, Watermelon: 0.8, Muskmelon: 0.8, 'Bitter Gourd': 0.78, Pumpkin: 0.85 },
  Sandy: { Wheat: 0.7, Barley: 0.72, Mustard: 0.75, Chickpea: 0.78, Lentil: 0.75, Rice: 0.6, Maize: 0.85, Cotton: 0.88, Soybean: 0.82, Sugarcane: 0.75, Potato: 0.82, Onion: 0.8, Tomato: 0.85, 'Pearl Millet': 0.88, Groundnut: 0.9, 'Pigeon Pea': 0.8, Pea: 0.75, Garlic: 0.72, Cucumber: 0.88, Watermelon: 0.9, Muskmelon: 0.9, 'Bitter Gourd': 0.85, Pumpkin: 0.88 },
  Silt: { Wheat: 0.92, Barley: 0.88, Mustard: 0.85, Chickpea: 0.88, Lentil: 0.88, Rice: 0.9, Maize: 0.88, Cotton: 0.82, Soybean: 0.88, Sugarcane: 0.82, Potato: 0.9, Onion: 0.88, Tomato: 0.9, 'Pearl Millet': 0.85, Groundnut: 0.88, 'Pigeon Pea': 0.88, Pea: 0.88, Garlic: 0.85, Cucumber: 0.9, Watermelon: 0.88, Muskmelon: 0.88, 'Bitter Gourd': 0.85, Pumpkin: 0.9 },
  'Clay-loam': { Wheat: 0.92, Barley: 0.88, Mustard: 0.9, Chickpea: 0.9, Lentil: 0.85, Rice: 0.88, Maize: 0.85, Cotton: 0.88, Soybean: 0.88, Sugarcane: 0.82, Potato: 0.92, Onion: 0.9, Tomato: 0.9, 'Pearl Millet': 0.85, Groundnut: 0.88, 'Pigeon Pea': 0.88, Pea: 0.9, Garlic: 0.88, Cucumber: 0.92, Watermelon: 0.9, Muskmelon: 0.9, 'Bitter Gourd': 0.88, Pumpkin: 0.92 },
};

/** Temperature range (min-max C) suitable for crop. Used with real weather. */
const TEMP_RANGE_C = {
  Wheat: [10, 25],
  Barley: [10, 24],
  Mustard: [10, 28],
  Chickpea: [10, 30],
  Lentil: [10, 28],
  Rice: [20, 38],
  Maize: [18, 35],
  Cotton: [21, 40],
  Soybean: [15, 35],
  Sugarcane: [20, 38],
  Potato: [15, 25],
  Onion: [13, 30],
  Tomato: [18, 32],
  'Pearl Millet': [20, 38],
  Groundnut: [20, 35],
  'Pigeon Pea': [18, 38],
  Pea: [10, 22],
  Garlic: [12, 28],
  Cucumber: [20, 35],
  Watermelon: [22, 38],
  Muskmelon: [22, 38],
  'Bitter Gourd': [20, 35],
  Pumpkin: [18, 32],
};

const YIELD_RANGE_T_HA = {
  Wheat: [4, 5.5],
  Barley: [3.5, 4.8],
  Mustard: [1, 1.6],
  Chickpea: [1.8, 2.6],
  Lentil: [0.9, 1.4],
  Rice: [4, 6],
  Maize: [5, 7],
  Cotton: [2, 3.5],
  Soybean: [2, 3],
  Sugarcane: [70, 100],
  Potato: [20, 35],
  Onion: [15, 25],
  Tomato: [25, 45],
  'Pearl Millet': [1.5, 2.5],
  Groundnut: [1.5, 2.5],
  'Pigeon Pea': [1, 1.8],
  Pea: [2, 4],
  Garlic: [5, 8],
  Cucumber: [20, 35],
  Watermelon: [25, 40],
  Muskmelon: [20, 30],
  'Bitter Gourd': [15, 25],
  Pumpkin: [20, 30],
};

const WATER_MM = {
  Wheat: [400, 550],
  Barley: [350, 500],
  Mustard: [350, 450],
  Chickpea: [350, 480],
  Lentil: [300, 420],
  Rice: [900, 1200],
  Maize: [450, 600],
  Cotton: [600, 900],
  Soybean: [400, 550],
  Sugarcane: [1500, 2500],
  Potato: [500, 700],
  Onion: [350, 550],
  Tomato: [400, 600],
  'Pearl Millet': [350, 500],
  Groundnut: [500, 700],
  'Pigeon Pea': [500, 700],
  Pea: [350, 500],
  Garlic: [400, 550],
  Cucumber: [400, 600],
  Watermelon: [500, 700],
  Muskmelon: [400, 600],
  'Bitter Gourd': [400, 600],
  Pumpkin: [400, 600],
};

function getYieldRange(crop) {
  return YIELD_RANGE_T_HA[crop] || [2, 4];
}

function getWaterRange(crop) {
  return WATER_MM[crop] || [400, 500];
}

function riskFactors(crop, soilType, season) {
  const factors = [];
  const soil = SOIL_SUITABILITY[soilType] || SOIL_SUITABILITY.Loam;
  const suit = soil[crop];
  if (suit != null && suit < 0.8) factors.push(`Marginal soil suitability for ${soilType}`);
  if (['Rice', 'Cotton', 'Sugarcane'].includes(crop)) factors.push('Water-intensive; ensure irrigation capacity');
  if (season === 'Kharif' && ['Wheat', 'Barley'].includes(crop)) factors.push('Typically Rabi crop; check local practices');
  if (['Sugarcane', 'Cotton'].includes(crop)) factors.push('Long duration; plan rotation and market access');
  if (factors.length === 0) factors.push('Low risk for given conditions');
  return factors;
}

function suitabilityScore(crop, soilType, season, tempC) {
  const soil = SOIL_SUITABILITY[soilType] || SOIL_SUITABILITY.Loam;
  let base = (soil[crop] ?? 0.75) * 100;
  const seasonPenalty = SEASON_CROPS[season] && SEASON_CROPS[season].includes(crop) ? 0 : -10;
  base = base + seasonPenalty;
  if (tempC != null && typeof tempC === 'number') {
    const range = TEMP_RANGE_C[crop];
    if (range) {
      const [lo, hi] = range;
      if (tempC < lo || tempC > hi) base -= 8;
    }
  }
  return Math.max(0, Math.min(100, Math.round(base)));
}

function confidence(location, soilType, season, farmSize, hasWeather) {
  const known = [location, soilType, season].filter(Boolean).length;
  const hasSize = typeof farmSize === 'number' && farmSize > 0;
  let c = 0.65 + (known / 3) * 0.2 + (hasSize ? 0.05 : 0);
  if (hasWeather) c += 0.05;
  return Math.min(0.95, Math.round(c * 100) / 100);
}

function explanationForCrop(crop, soilType, season, tempC) {
  const soil = SOIL_SUITABILITY[soilType] || SOIL_SUITABILITY.Loam;
  const suit = soil[crop] ?? 0.75;
  const inSeason = SEASON_CROPS[season] && SEASON_CROPS[season].includes(crop);
  const parts = [];
  parts.push(`${crop} is ${inSeason ? 'aligned with' : 'sometimes grown in'} ${season} in India.`);
  parts.push(`Soil suitability for ${soilType}: ${Math.round(suit * 100)}%.`);
  if (tempC != null && typeof tempC === 'number') {
    const range = TEMP_RANGE_C[crop];
    if (range) {
      const [lo, hi] = range;
      if (tempC >= lo && tempC <= hi) {
        parts.push(`Current temperature (${tempC} C) is within typical range (${lo}-${hi} C).`);
      } else {
        parts.push(`Current temperature (${tempC} C) is outside typical range (${lo}-${hi} C); consider local varieties.`);
      }
    }
  }
  return parts.join(' ');
}

async function recommendCrops(payload) {
  const { location, soilType, season, farmSize } = payload;

  let weather = null;
  if (location && String(location).trim()) {
    try {
      weather = await weatherService.getWeatherForLocation(String(location).trim());
    } catch (_) {}
  }
  const tempC = weather && typeof weather.temperatureC === 'number' ? weather.temperatureC : null;

  const candidates = SEASON_CROPS[season] || SEASON_CROPS.Rabi;
  const soil = SOIL_SUITABILITY[soilType] || SOIL_SUITABILITY.Loam;

  const withScores = candidates
    .filter((crop) => soil[crop] != null)
    .map((crop) => ({
      crop,
      suitabilityScore: suitabilityScore(crop, soilType, season, tempC),
      expectedYield: getYieldRange(crop),
      waterRequirement: getWaterRange(crop),
      riskFactors: riskFactors(crop, soilType, season),
    }))
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 8);

  const recommendedCrops = withScores.map(({ crop, suitabilityScore: s, expectedYield: y, waterRequirement: w, riskFactors: r }) => ({
    crop,
    suitabilityScore: s,
    expectedYield: (y[0] + y[1]) / 2,
    waterRequirement: (w[0] + w[1]) / 2,
    riskFactors: r,
    explanation: explanationForCrop(crop, soilType, season, tempC),
  }));

  const conf = confidence(location, soilType, season, farmSize, !!weather);

  const out = {
    recommendedCrops,
    confidence: Math.round(conf * 100) / 100,
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

/** Returns sorted list of all crop names used in the platform (for schemes filter and admin). */
function getCropList() {
  const set = new Set();
  Object.values(SEASON_CROPS).forEach((arr) => arr.forEach((c) => set.add(c)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

module.exports = {
  recommendCrops,
  getCropList,
  SEASON_CROPS,
};

