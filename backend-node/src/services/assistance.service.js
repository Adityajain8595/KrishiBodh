

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not set. Assistance service will be unavailable.');
  console.warn('   Please set GEMINI_API_KEY in your .env file');
} else {
  console.log('✓ GEMINI_API_KEY found');
}

let genAI = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✓ Gemini AI client initialized successfully');
  } catch (err) {
    console.error('✗ Failed to initialize Gemini:', err.message);
    console.error('  Error details:', err);
  }
} else {
  console.warn('⚠️  Gemini AI client not initialized - API key missing');
}

// Session memory: stores last few conversation turns per session
const sessionMemory = new Map();
const MAX_MEMORY_TURNS = 5;
const MEMORY_TTL = 30 * 60 * 1000; // 30 minutes

function cleanupOldSessions() {
  const now = Date.now();
  for (const [sessionId, data] of sessionMemory.entries()) {
    if (now - data.lastAccess > MEMORY_TTL) {
      sessionMemory.delete(sessionId);
    }
  }
}

// Cleanup every 10 minutes
setInterval(cleanupOldSessions, 10 * 60 * 1000);

function getSessionMemory(sessionId) {
  if (!sessionMemory.has(sessionId)) {
    sessionMemory.set(sessionId, {
      messages: [],
      lastAccess: Date.now(),
    });
  }
  const session = sessionMemory.get(sessionId);
  session.lastAccess = Date.now();
  return session.messages;
}

function addToSessionMemory(sessionId, userMessage, assistantMessage) {
  const messages = getSessionMemory(sessionId);
  messages.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: assistantMessage }
  );
  // Keep only last MAX_MEMORY_TURNS turns
  if (messages.length > MAX_MEMORY_TURNS * 2) {
    messages.splice(0, messages.length - MAX_MEMORY_TURNS * 2);
  }
}

function buildContextSummary(context) {
  const parts = [];
  
  if (context.crop) {
    parts.push(`Selected crop: ${context.crop}`);
  }
  if (context.location) {
    parts.push(`Location: ${context.location}`);
  }
  if (context.weather) {
    const w = context.weather;
    parts.push(`Current weather: ${w.temperatureC}°C, ${w.humidity}% humidity, ${w.precipitationMm}mm precipitation`);
  }
  if (context.irrigation) {
    const irr = context.irrigation;
    parts.push(`Irrigation recommendation: ${irr.dailyWater} KL/day, ${irr.riskLevel} risk, efficiency ${irr.efficiencyScore}`);
  }
  if (context.yield) {
    const y = context.yield;
    parts.push(`Yield estimation: ${y.predictedYield} t/ha, ${y.riskLevel} risk`);
  }
  if (context.market) {
    const m = context.market;
    if (m.prices && m.prices.length > 0) {
      const avgPrice = m.prices.reduce((sum, p) => sum + (p.modalPrice || 0), 0) / m.prices.length;
      parts.push(`Market prices: Average ₹${avgPrice.toFixed(2)}/quintal`);
    }
  }
  
  return parts.length > 0 ? parts.join('. ') : 'No specific context available.';
}

function buildSystemPrompt(language) {
  const isHindi = language === 'hi' || language === 'hindi';
  
  if (isHindi) {
    return `आप एक कृषि निर्णय सहायता प्रणाली के लिए एक व्यावसायिक स्पष्टीकरण सहायक हैं। आपका कार्य केवल मौजूदा निर्धारक प्रणाली के आउटपुट की व्याख्या करना है।

महत्वपूर्ण नियम:
- आप कभी भी निर्णय नहीं लेते या संख्याएं नहीं बनाते
- आप केवल पहले से उत्पन्न परिणामों की व्याख्या करते हैं
- उत्तर व्यावसायिक, संक्षिप्त और स्पष्ट होने चाहिए
- इमोजी का उपयोग न करें
- सरल प्रश्नों के लिए छोटा पैराग्राफ, जटिल प्रश्नों के लिए संरचित बुलेट पॉइंट्स

यदि प्रश्न कृषि से संबंधित नहीं है, तो विनम्रता से मना करें:
"मैं कृषि और खेती से संबंधित प्रश्नों में मदद कर सकता हूं। कृपया फसल, सिंचाई, मौसम, या बाजार के रुझान से संबंधित कुछ पूछें।"

यदि संदर्भ उपलब्ध नहीं है, तो सामान्य उत्तर दें और एक अस्वीकरण शामिल करें।`;
  }
  
  return `You are a professional explanation assistant for an agricultural decision support system. Your role is ONLY to explain outputs from the existing deterministic system.

Critical rules:
- You NEVER make decisions or generate numbers
- You ONLY explain results that were already generated
- Answers must be professional, concise, and to the point
- Do not use emojis
- Use short paragraph for simple questions, structured bullet points for complex questions

If the question is unrelated to agriculture, politely refuse:
"I can help with agriculture and farming-related questions. Please ask something related to crops, irrigation, weather, or market trends."

If context is not available, provide a general answer and include a clear disclaimer.`;
}

function isAgricultureRelated(question) {
  const q = question.toLowerCase();
  
  // Common agriculture terms
  const agricultureTerms = [
    'crop', 'irrigation', 'water', 'yield', 'pest', 'soil', 'weather', 'market', 'price',
    'harvest', 'fertilizer', 'seed', 'farming', 'agriculture', 'farm', 'field',
    'planting', 'sowing', 'cultivation', 'growing', 'production', 'commodity',
    'mandi', 'mandi price', 'crop yield', 'crop production',
    'फसल', 'सिंचाई', 'पानी', 'उपज', 'कीट', 'मिट्टी', 'मौसम', 'बाजार', 'कीमत'
  ];
  
  // Crop names (all supported crops)
  const cropNames = [
    'wheat', 'rice', 'maize', 'corn', 'cotton', 'sugarcane', 'soybean', 'barley',
    'mustard', 'chickpea', 'gram', 'chana', 'lentil', 'masur', 'potato', 'onion',
    'tomato', 'groundnut', 'peanut', 'pearl millet', 'bajra', 'pigeon pea', 'arhar', 'tur',
    'pea', 'garlic', 'cucumber', 'watermelon', 'muskmelon', 'bitter gourd', 'pumpkin',
    'paddy', 'dhan', 'gehun', 'makka', 'kapas', 'sarson', 'jau'
  ];
  
  // Check if question contains any agriculture term or crop name
  const allTerms = [...agricultureTerms, ...cropNames];
  return allTerms.some(term => q.includes(term));
}

async function askGemini(question, context, language, sessionId) {
  if (!genAI) {
    throw new Error('Gemini service not available');
  }

  const isHindi = language === 'hi' || language === 'hindi';
  
  // Basic scope check - but let Gemini handle detailed scope via system prompt
  // This is just to catch obviously unrelated questions early
  const isObviouslyUnrelated = question.length > 10 && !isAgricultureRelated(question);
  
  if (isObviouslyUnrelated) {
    // Only block if question is long enough and clearly unrelated
    // Short questions or questions with any agriculture term should go through
    if (isHindi) {
      return 'मैं कृषि और खेती से संबंधित प्रश्नों में मदद कर सकता हूं। कृपया फसल, सिंचाई, मौसम, या बाजार के रुझान से संबंधित कुछ पूछें।';
    }
    return 'I can help with agriculture and farming-related questions. Please ask something related to crops, irrigation, weather, or market trends.';
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const systemPrompt = buildSystemPrompt(language);
  const contextSummary = buildContextSummary(context);
  const sessionMessages = getSessionMemory(sessionId);

  // Build conversation history (only if we have messages)
  const history = sessionMessages.length > 0 
    ? sessionMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))
    : [];

  // Build current prompt
  const prompt = `${systemPrompt}

Current user context:
${contextSummary}

User question: ${question}

Provide a professional, concise explanation based on the context above. If specific context is missing, provide a general answer with a disclaimer.`;

  try {
    console.log('Sending request to Gemini API...', {
      model: 'gemini-1.5-flash',
      hasHistory: history.length > 0,
      promptLength: prompt.length,
      questionLength: question.length,
    });

    let chat;
    if (history.length > 0) {
      chat = model.startChat({ history });
    } else {
      chat = model.startChat();
    }

    const result = await chat.sendMessage(prompt);
    
    if (!result) {
      throw new Error('No result from Gemini API');
    }
    
    const response = await result.response;
    
    if (!response) {
      throw new Error('No response from Gemini API');
    }
    
    let answer = response.text();
    
    if (!answer || answer.trim().length === 0) {
      console.warn('Empty response from Gemini API');
      throw new Error('Empty response from Gemini API');
    }
    
    console.log('Gemini API response received:', {
      answerLength: answer.length,
      preview: answer.substring(0, 100) + '...',
    });

    // Ensure answer doesn't contain numbers or recommendations (safety check)
    // This is a basic check - in production, you might want more sophisticated filtering
    if (answer.length > 2000) {
      answer = answer.substring(0, 2000) + '...';
    }

    // Store in session memory
    addToSessionMemory(sessionId, question, answer);

    console.log('Gemini API response received successfully');
    return answer;
  } catch (err) {
    console.error('Gemini API error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Assistant temporarily unavailable. Please try again later.';
    if (err.message && err.message.includes('API_KEY')) {
      errorMessage = 'Gemini API key is invalid or missing.';
    } else if (err.message && err.message.includes('quota')) {
      errorMessage = 'Gemini API quota exceeded. Please try again later.';
    } else if (err.message && err.message.includes('safety')) {
      errorMessage = 'The question was blocked by safety filters. Please rephrase.';
    }
    
    if (isHindi) {
      errorMessage = 'सहायक अस्थायी रूप से अनुपलब्ध है। कृपया बाद में पुनः प्रयास करें।';
    }
    
    throw new Error(errorMessage);
  }
}

async function ask(payload) {
  const { question, context = {}, language = 'en', sessionId } = payload;

  if (!question || typeof question !== 'string' || question.trim().length < 2) {
    throw new Error('Question must be at least 2 characters');
  }

  if (question.length > 500) {
    throw new Error('Question too long (max 500 characters)');
  }

  if (!genAI) {
    throw new Error('Gemini service not configured');
  }

  const answer = await askGemini(question.trim(), context, language, sessionId || 'default');
  
  return {
    answer,
  };
}

// Export for status check
function getStatus() {
  return {
    hasApiKey: !!GEMINI_API_KEY,
    isInitialized: !!genAI,
  };
}

module.exports = {
  ask,
  getStatus,
};
