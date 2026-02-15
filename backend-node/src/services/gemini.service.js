/**
 * Google Gemini AI Service
 * Clean implementation for explanation and assistance only.
 * NEVER makes decisions or generates numbers.
 */

const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY not found in environment variables');
  console.error('Please set GEMINI_API_KEY in your .env file');
}

let client = null;
if (GEMINI_API_KEY) {
  try {
    client = new GoogleGenAI({
      apiKey: GEMINI_API_KEY
    });
    console.log('✓ Gemini AI client initialized');
  } catch (err) {
    console.error('✗ Failed to initialize Gemini:', err.message);
  }
} else {
  console.warn('⚠️  Gemini AI client not initialized - API key missing');
}

/**
 * Build context summary from provided context object
 */
function buildContextSummary(context) {
  if (!context || typeof context !== 'object') {
    return 'Not provided';
  }
  
  const parts = [];
  
  if (context.crop) {
    parts.push(`Crop: ${context.crop}`);
  }
  if (context.location) {
    parts.push(`Location: ${context.location}`);
  }
  if (context.weather) {
    const w = context.weather;
    parts.push(`Weather: ${w.temperatureC}°C, ${w.humidity}% humidity, ${w.precipitationMm}mm precipitation`);
  }
  if (context.irrigation) {
    const irr = context.irrigation;
    parts.push(`Irrigation: ${irr.dailyWater} KL/day, ${irr.riskLevel} risk, efficiency ${irr.efficiencyScore}`);
  }
  if (context.yield) {
    const y = context.yield;
    parts.push(`Yield: ${y.predictedYield} t/ha, ${y.riskLevel} risk`);
  }
  if (context.market) {
    const m = context.market;
    if (m.prices && Array.isArray(m.prices) && m.prices.length > 0) {
      const avgPrice = m.prices.reduce((sum, p) => sum + (p.modalPrice || 0), 0) / m.prices.length;
      parts.push(`Market: Average ₹${avgPrice.toFixed(2)}/quintal`);
    }
  }
  
  return parts.length > 0 ? parts.join('. ') : 'Not provided';
}

/**
 * Ask Gemini AI
 * @param {Object} params
 * @param {string} params.question - User question
 * @param {Object} params.context - Context object
 * @param {string} params.language - Language code ('en' or 'hi')
 * @param {Array} params.history - Conversation history
 * @returns {Promise<string>} Gemini response
 */
async function askGemini({ question, context = {}, language = 'en', history = [] }) {
  if (!client) {
    throw new Error('Gemini service not available. API key may be missing or invalid.');
  }

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new Error('Question is required and must be a non-empty string');
  }

  const systemInstruction = `
You are an agricultural assistance and explanation system for farmers, FPOs and agronomy teams.

Tone:
- Sound like a calm, practical agriculture advisor
- Never say things like "as an AI model" or talk about being a chatbot

Style:
- Default answer is ONE short paragraph of 4–5 lines
- Use plain text, no markdown headings or decorative bullets
- Only use short lists when the user clearly asks for "list", "types", "steps" or "details"

Content rules:
- Focus on crops, irrigation, soil, pests, weather, markets and related decisions
- If context is provided, gently weave 2–3 key points from it into the explanation
- Do NOT invent new numeric predictions or hard recommendations, only explain what the data suggests
- No emojis
- Language: ${language === "hi" ? "Hindi" : "English"}
`;

  // Build context summary
  const contextSummary = buildContextSummary(context);

  // Include recent conversation context if available
  let conversationContext = '';
  if (Array.isArray(history) && history.length > 0) {
    const recentMessages = history.slice(-4); // Last 2 pairs
    conversationContext = '\n\nRecent conversation:\n' + 
      recentMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
  }

  const hasContext = contextSummary !== 'Not provided' && contextSummary.trim().length > 0;
  
  const prompt = `
${systemInstruction}

${hasContext ? `Context provided:
${contextSummary}${conversationContext}

Use this context to provide a more specific answer.` : `No specific context provided. Provide general educational information about the topic.`}

User question:
${question.trim()}

Provide a helpful and informative explanation${hasContext ? ' using the provided context when relevant' : ' with general information about the topic'}.
`;

  // Format answer to match Krishibodh UI style: short, clean paragraphs without markdown noise
  function formatAnswer(raw, question, lang) {
    if (!raw || typeof raw !== "string") return "";
    let text = raw.replace(/\r/g, "").trim();

    // Strip common markdown artifacts (headings, bullets, backticks)
    text = text
      .replace(/^#{1,6}\s+/gm, "") // headings
      .replace(/^[*\-+]\s+/gm, "") // bullet markers
      .replace(/^\d+\.\s+/gm, "") // numbered lists
      .replace(/`{1,3}/g, ""); // backticks

    const lowerQ = (question || "").toLowerCase();
    const wantsList =
      /list|lists|types|kinds|steps|detail|details|more/.test(lowerQ);

    if (!wantsList) {
      // Collapse newlines into spaces for a compact paragraph
      text = text.replace(/\n+/g, " ");
    } else {
      // Normalise multiple blank lines
      text = text.replace(/\n{3,}/g, "\n\n");
    }

    // Collapse extra spaces
    text = text.replace(/\s{2,}/g, " ").trim();

    // For normal answers, keep it to ~4 sentences max
    if (!wantsList) {
      const sentences = text.split(/(?<=[.!?])\s+/);
      if (sentences.length > 4) {
        text = sentences.slice(0, 4).join(" ");
      }
    }

    return text;
  }

  try {
    console.log('[Gemini] Sending request...', {
      questionLength: question.length,
      hasContext: Object.keys(context).length > 0,
      hasHistory: Array.isArray(history) && history.length > 0,
      language,
    });

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    if (!response) {
      throw new Error('No response from Gemini API');
    }

    // Extract text from response
    let text = '';
    if (response.text) {
      text = response.text;
    } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      const content = response.candidates[0].content;
      if (content.parts && content.parts[0] && content.parts[0].text) {
        text = content.parts[0].text;
      }
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    // Limit response length
    const trimmedText = text.trim();
    const limitedText = trimmedText.length > 2000 
      ? trimmedText.substring(0, 2000) + '...' 
      : trimmedText;

    const finalAnswer = formatAnswer(limitedText, question, language);

    console.log('[Gemini] Response received successfully', {
      answerLength: finalAnswer.length,
      preview: finalAnswer.substring(0, 100),
    });

    return finalAnswer;
  } catch (err) {
    console.error('[Gemini] Error details:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    
    // Re-throw with user-friendly message
    const isHindi = language === 'hi' || language === 'hindi';
    const errorMsg = isHindi
      ? 'सहायक अस्थायी रूप से अनुपलब्ध है। कृपया बाद में पुनः प्रयास करें।'
      : 'Assistant temporarily unavailable. Please try again later.';
    
    throw new Error(errorMsg);
  }
}

module.exports = {
  askGemini,
};
