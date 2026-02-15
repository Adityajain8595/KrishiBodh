/**
 * Speech-to-Text Controller
 * Handles STT requests
 */

const sttService = require('../services/stt.service');
const { validationError } = require('../utils/errors');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files (webm, ogg, wav, etc.)
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      // More permissive - accept any file if mimetype check fails (browsers sometimes send wrong mimetype)
      console.warn('[STT] Unexpected mimetype:', file.mimetype, 'Accepting anyway');
      cb(null, true);
    }
  },
});

// Error handling middleware for multer
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Audio file too large. Maximum size is 25MB.' });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  next();
}

async function transcribe(req, res, next) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      console.error('[STT Controller] No file uploaded', {
        body: req.body,
        files: req.files,
      });
      throw validationError('Audio file is required');
    }

    // Validate file buffer
    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.error('[STT Controller] Empty file buffer', {
        fileSize: req.file.size,
        mimetype: req.file.mimetype,
      });
      throw validationError('Audio file is empty or corrupted');
    }

    const { language } = req.body;

    // Validate and normalize language
    const validLanguages = ['en', 'hi', 'english', 'hindi'];
    const normalizedLang = validLanguages.includes(language?.toLowerCase())
      ? (language.toLowerCase().startsWith('hi') ? 'hi' : 'en')
      : 'en';

    console.log('[STT Controller] Request received', {
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      bufferLength: req.file.buffer.length,
      language: normalizedLang,
      userId: req.user?.uid,
    });

    // Transcribe audio
    const transcription = await sttService.transcribeAudio(
      req.file.buffer,
      normalizedLang
    );

    console.log('[STT Controller] Transcription successful', {
      textLength: transcription.length,
    });

    res.json({
      transcription,
    });
  } catch (e) {
    console.error('[STT Controller] Error:', {
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
    const error = new Error(e.message || 'STT service error');
    error.statusCode = 500;
    next(error);
  }
}

// Export both the controller function and multer middleware
module.exports = {
  transcribe,
  upload: upload.single('file'),
  handleMulterError,
};
