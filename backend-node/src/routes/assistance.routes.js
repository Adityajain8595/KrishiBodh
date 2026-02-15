const express = require('express');
const assistanceController = require('../controllers/assistance.controller');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

// All assistance routes require authentication
router.use(verifyAuth);

router.post('/ask', assistanceController.ask);

// Debug endpoint to check Gemini status (remove in production)
router.get('/status', (req, res) => {
  const assistanceService = require('../services/assistance.service');
  const status = assistanceService.getStatus();
  
  res.json({
    geminiApiKeySet: status.hasApiKey,
    geminiInitialized: status.isInitialized,
    geminiApiKeyLength: status.hasApiKey ? process.env.GEMINI_API_KEY.length : 0,
    message: status.hasApiKey 
      ? (status.isInitialized 
          ? 'Gemini API is configured and initialized.'
          : 'Gemini API key is set but initialization failed. Check server logs.')
      : 'GEMINI_API_KEY is not set in environment variables.',
  });
});

module.exports = router;
