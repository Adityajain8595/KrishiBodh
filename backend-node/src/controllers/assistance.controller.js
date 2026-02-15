const assistanceService = require('../services/assistance.service');
const { validationError } = require('../utils/errors');

async function ask(req, res, next) {
  try {
    const { question, context, language, sessionId } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length < 2) {
      throw validationError('Question must be at least 2 characters');
    }

    if (question.length > 500) {
      throw validationError('Question too long (max 500 characters)');
    }

    // Validate language
    const validLanguages = ['en', 'hi', 'english', 'hindi'];
    const lang = language || 'en';
    const normalizedLang = validLanguages.includes(lang.toLowerCase()) 
      ? (lang.toLowerCase().startsWith('hi') ? 'hi' : 'en')
      : 'en';

    // Use user ID as session ID if not provided
    const session = sessionId || req.user?.uid || 'default';

    console.log('Assistance request received:', {
      question: question.substring(0, 50) + '...',
      language: normalizedLang,
      sessionId: session,
      hasContext: !!context && Object.keys(context).length > 0,
    });

    const result = await assistanceService.ask({
      question: question.trim(),
      context: context || {},
      language: normalizedLang,
      sessionId: session,
    });

    console.log('Assistance response generated successfully');
    res.json(result);
  } catch (e) {
    console.error('Assistance controller error:', {
      message: e.message,
      stack: e.stack,
    });
    next(e);
  }
}

module.exports = {
  ask,
};
