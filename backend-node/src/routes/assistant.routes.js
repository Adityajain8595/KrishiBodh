/**
 * Assistant Routes
 * Gemini AI assistance endpoint
 */

const express = require('express');
const assistantController = require('../controllers/assistant.controller');
const ttsController = require('../controllers/tts.controller');
const sttController = require('../controllers/stt.controller');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

const router = express.Router();

// All routes require authentication
router.use(verifyFirebaseToken);

// POST /api/assistant/ask
router.post('/ask', assistantController.ask);

// POST /api/assistant/tts - Text-to-Speech
router.post('/tts', ttsController.synthesize);

// POST /api/assistant/transcribe - Speech-to-Text
// Multer middleware with error handling
router.post('/transcribe', (req, res, next) => {
  sttController.upload(req, res, (err) => {
    if (err) {
      return sttController.handleMulterError(err, req, res, next);
    }
    next();
  });
}, sttController.transcribe);

// GET /api/assistant/health - Test endpoint (requires auth)
router.get('/health', (req, res) => {
  const geminiService = require('../services/gemini.service');
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  
  res.json({
    status: 'ok',
    authenticated: true,
    geminiApiKeySet: hasApiKey,
    message: hasApiKey 
      ? 'Gemini API key is configured'
      : 'GEMINI_API_KEY is not set in environment variables',
  });
});

module.exports = router;
