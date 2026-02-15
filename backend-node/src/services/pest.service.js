/**
 * Pest risk and prevention. Uses real weather (humidity, temp) when location provided.
 * Rule-based; deterministic. No random values.
 */

const weatherService = require('./weather.service');

const CROP_PESTS = {
  Wheat: ['Aphids', 'Rust', 'Termites', 'Army worm', 'Stem borer'],
  Maize: ['Fall armyworm', 'Stem borer', 'Aphids', 'Earworm', 'Leaf blight'],
  Rice: ['Stem borer', 'Leafhopper', 'Blast', 'Brown spot', 'Sheath blight'],
  Cotton: ['Bollworm', 'Aphids', 'Whitefly', 'Jassids', 'Leaf curl'],
  Soybean: ['Aphids', 'Defoliators', 'Rust', 'Yellow mosaic', 'Pod borer'],
  Sugarcane: ['Borer', 'Aphids', 'Scale', 'Red rot', 'Smut'],
  Barley: ['Aphids', 'Rust', 'Net blotch', 'Powdery mildew'],
  Mustard: ['Aphids', 'Flea beetle', 'Stem borer', 'White rust'],
  Chickpea: ['Pod borer', 'Aphids', 'Cutworm', 'Wilt', 'Stem rot'],
  Lentil: ['Aphids', 'Pod borer', 'Rust', 'Wilt'],
  Potato: ['Aphids', 'Late blight', 'Early blight', 'Cutworm', 'Mites'],
  Onion: ['Thrips', 'Stemphylium blight', 'Purple blotch', 'Downy mildew'],
  Tomato: ['Fruit borer', 'Whitefly', 'Leaf curl', 'Early blight', 'Late blight'],
  Groundnut: ['Leaf miner', 'Aphids', 'Tikka', 'Rust', 'Stem rot'],
  'Pearl Millet': ['Downy mildew', 'Striga', 'Blast', 'Rust'],
  'Pigeon Pea': ['Pod borer', 'Wilt', 'Sterility mosaic', 'Phytophthora'],
};

const STAGE_RISK = {
  seedling: 0.6,
  vegetative: 0.85,
  flowering: 0.95,
  fruiting: 0.9,
  maturity: 0.5,
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

function weatherRiskAdjustment(humidity, tempC) {
  let adj = 0;
  if (typeof humidity === 'number') {
    if (humidity > 80) adj += 0.08;
    else if (humidity > 70) adj += 0.04;
  }
  if (typeof tempC === 'number') {
    if (tempC >= 30 && tempC <= 38) adj += 0.03;
  }
  return Math.min(0.15, adj);
}

function computePestRisk(cropType, growthStage, humidity, tempC) {
  const stage = normalizeStage(growthStage);
  const baseRisk = STAGE_RISK[stage] ?? 0.7;
  const cropFactor = ['Cotton', 'Rice', 'Maize', 'Tomato'].includes(cropType) ? 1.1 : 1;
  const weatherAdj = weatherRiskAdjustment(humidity, tempC);
  const score = Math.min(1, baseRisk * cropFactor + weatherAdj);
  if (score >= 0.85) return 'High';
  if (score >= 0.65) return 'Medium';
  return 'Low';
}

function getLikelyPests(cropType, riskLevel) {
  const pests = CROP_PESTS[cropType] || CROP_PESTS.Wheat;
  const n = riskLevel === 'High' ? 4 : riskLevel === 'Medium' ? 3 : 2;
  return pests.slice(0, n);
}

function getPreventionMeasures(cropType, growthStage, riskLevel) {
  const measures = [];
  const stage = normalizeStage(growthStage);
  if (riskLevel === 'High') {
    measures.push('Schedule scouting twice per week; apply preventive spray if threshold reached.');
    measures.push('Remove crop residue and alternate hosts to reduce carryover.');
  }
  if (stage === 'flowering') measures.push('Avoid broad-spectrum insecticides during flowering to protect pollinators.');
  measures.push(`Use recommended thresholds for ${cropType}; treat only when economic threshold is exceeded.`);
  measures.push('Keep field borders and irrigation channels weed-free to reduce pest harborage.');
  return measures;
}

async function analyzePest(payload) {
  const { cropType, growthStage, location } = payload;

  let weather = null;
  if (location && String(location).trim()) {
    try {
      weather = await weatherService.getWeatherForLocation(String(location).trim());
    } catch (_) {}
  }
  const humidity = weather && typeof weather.humidity === 'number' ? weather.humidity : null;
  const tempC = weather && typeof weather.temperatureC === 'number' ? weather.temperatureC : null;

  const pestRisk = computePestRisk(cropType, growthStage, humidity, tempC);
  const likelyPests = getLikelyPests(cropType, pestRisk);
  const preventionMeasures = getPreventionMeasures(cropType, growthStage, pestRisk);

  const out = {
    pestRisk,
    likelyPests,
    preventionMeasures,
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
  analyzePest,
};

