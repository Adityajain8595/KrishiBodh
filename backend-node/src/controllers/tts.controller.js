/**
 * Text-to-Speech Controller
 * Handles TTS requests
 */

const ttsService = require('../services/tts.service');
const { validationError } = require('../utils/errors');

async function synthesize(req, res, next) {
  try {
    const { text, lang, voice } = req.body;

    // Validate text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw validationError('Text is required and must be a non-empty string');
    }

    if (text.length > 5000) {
      throw validationError('Text too long (max 5000 characters)');
    }

    // Validate and normalize language
    const validLanguages = ['en', 'hi', 'english', 'hindi'];
    const normalizedLang = validLanguages.includes(lang?.toLowerCase())
      ? (lang.toLowerCase().startsWith('hi') ? 'hi' : 'en')
      : 'en';

    // Validate voice
    const normalizedVoice = voice === 'male' ? 'male' : 'female';

    console.log('[TTS Controller] Request received', {
      textLength: text.length,
      language: normalizedLang,
      voice: normalizedVoice,
      userId: req.user?.uid,
    });

    // Generate audio
    const audioBuffer = await ttsService.textToSpeechAudio(
      text.trim(),
      normalizedLang,
      normalizedVoice
    );

    // Set response headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Send audio buffer
    res.send(audioBuffer);
  } catch (e) {
    console.error('[TTS Controller] Error:', {
      message: e.message,
      name: e.name,
      statusCode: e.statusCode,
      stack: e.stack,
    });
    
    // If it's already an AppError with statusCode, pass it through
    if (e.statusCode) {
      return next(e);
    }
    
    // Otherwise, wrap it in a 500 error
    const error = new Error(e.message || 'TTS service error');
    error.statusCode = 500;
    next(error);
  }
}

module.exports = {
  synthesize,
};
