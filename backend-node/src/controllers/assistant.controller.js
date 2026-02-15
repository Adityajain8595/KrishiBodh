/**
 * Assistant Controller
 * Handles Gemini assistance requests
 */

const geminiService = require('../services/gemini.service');
const { validationError } = require('../utils/errors');

async function ask(req, res, next) {
  try {
    const { question, context, language, history } = req.body;

    // Validate question
    if (!question || typeof question !== 'string') {
      throw validationError('Question is required and must be a string');
    }

    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 2) {
      throw validationError('Question must be at least 2 characters');
    }

    if (trimmedQuestion.length > 500) {
      throw validationError('Question too long (max 500 characters)');
    }

    // Validate and normalize language
    const validLanguages = ['en', 'hi', 'english', 'hindi'];
    const lang = language || 'en';
    const normalizedLang = validLanguages.includes(lang.toLowerCase())
      ? (lang.toLowerCase().startsWith('hi') ? 'hi' : 'en')
      : 'en';

    // Validate history if provided
    let validHistory = [];
    if (history) {
      if (!Array.isArray(history)) {
        throw validationError('History must be an array');
      }
      validHistory = history.filter(h => 
        h && 
        typeof h === 'object' && 
        (h.role === 'user' || h.role === 'assistant') &&
        typeof h.content === 'string' &&
        h.content.trim().length > 0
      ).slice(-10); // Keep only last 10 messages
    }

    console.log('[Assistant] Request received', {
      question: trimmedQuestion.substring(0, 50),
      language: normalizedLang,
      hasContext: !!context && Object.keys(context).length > 0,
      historyLength: validHistory.length,
      userId: req.user?.uid,
    });

    // Call Gemini service
    const answer = await geminiService.askGemini({
      question: trimmedQuestion,
      context: context || {},
      language: normalizedLang,
      history: validHistory,
    });

    console.log('[Assistant] Response generated', {
      answerLength: answer.length,
    });

    res.json({
      answer,
    });
  } catch (e) {
    console.error('[Assistant] Controller error:', {
      message: e.message,
      statusCode: e.statusCode,
      name: e.name,
      stack: e.stack,
    });
    
    // Ensure error has statusCode for proper HTTP response
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    
    next(e);
  }
}

module.exports = {
  ask,
};
