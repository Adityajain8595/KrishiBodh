/**
 * AI Assistant: Context-aware answers by module. Rule-based responses.
 * ML: replace with LLM or retrieval-augmented generation (RAG) over docs.
 */

const MODULE_CONTEXT = {
  AquaFarm: {
    intro: 'AquaFarm AI handles irrigation scheduling and water optimization.',
    topics: ['irrigation', 'water', 'schedule', 'efficiency', 'soil moisture', 'drip', 'sprinkler'],
    fallback: 'For irrigation and water scheduling, use the Water & Irrigation module. I can explain efficiency scores and risk levels based on your inputs.',
  },
  AgriSmart: {
    intro: 'AgriSmart AI recommends crops by location, soil, and season.',
    topics: ['crop', 'recommendation', 'soil', 'season', 'suitability', 'yield', 'rotation'],
    fallback: 'For crop recommendations, use the Crop Recommendation module with your location, soil type, and season. Suitability scores and risk factors are computed from agronomic rules.',
  },
  CropGuard: {
    intro: 'CropGuard AI covers yield prediction and pest risk.',
    topics: ['yield', 'pest', 'disease', 'risk', 'prediction', 'spray', 'scouting'],
    fallback: 'For yield and pest intelligence, use the Yield & Pest module. Predictions use crop stage, soil, and irrigation; pest risk is based on crop and growth stage.',
  },
};

function normalizeQuestion(q) {
  return (q || '').toLowerCase().trim();
}

/**
 * Rule-based answer selection. ML: call LLM with context + question, or RAG over knowledge base.
 */
function selectAnswer(module, question) {
  const q = normalizeQuestion(question);
  const ctx = MODULE_CONTEXT[module] || MODULE_CONTEXT.AquaFarm;

  if (q.includes('how') && q.includes('work')) {
    return `${ctx.intro} Inputs are processed with rule-based logic; confidence scores reflect input completeness. Trained ML models can be plugged in later for higher accuracy.`;
  }
  if (q.includes('confidence') || q.includes('score')) {
    return 'Confidence scores are derived from how complete and consistent your inputs are. In a full ML setup, they would come from model uncertainty or calibration.';
  }
  if (q.includes('irrigation') && module === 'AquaFarm') {
    return 'Irrigation recommendations combine crop water need by growth stage, soil type, and system efficiency. Schedule and risk are computed from these factors.';
  }
  if (q.includes('crop') && (q.includes('choose') || q.includes('recommend')) && module === 'AgriSmart') {
    return 'Crops are recommended by matching your soil type and season to suitability rules. Expected yield and water requirement are estimated per crop.';
  }
  if ((q.includes('yield') || q.includes('pest')) && module === 'CropGuard') {
    return 'Yield is estimated from crop, growth stage, soil, and irrigation. Pest risk and likely pests are based on crop and stage; prevention measures follow integrated pest management guidelines.';
  }
  if (q.length < 10) {
    return 'Please ask a more specific question about irrigation, crop recommendation, or yield and pest so I can give a useful answer.';
  }

  return ctx.fallback;
}

/**
 * Confidence for chat. ML: use LLM confidence or retrieval score.
 */
function confidence(module, question) {
  const q = normalizeQuestion(question);
  const ctx = MODULE_CONTEXT[module];
  const topicMatch = ctx && ctx.topics.some((t) => q.includes(t));
  return topicMatch ? 0.85 : 0.72;
}

async function ask(payload) {
  const { module: mod, question } = payload;
  const answer = selectAnswer(mod, question);
  const conf = confidence(mod, question);

  return {
    answer,
    confidence: Math.round(conf * 100) / 100,
  };
}

module.exports = {
  ask,
};
