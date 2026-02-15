/**
 * Speech-to-Text Service
 * Uses Groq Whisper API
 */

const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Initialize Groq client
let groqClient = null;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (GROQ_API_KEY) {
  try {
    groqClient = new Groq({
      apiKey: GROQ_API_KEY,
    });
    console.log('✓ Groq Whisper client initialized');
  } catch (err) {
    console.error('✗ Failed to initialize Groq Whisper:', err.message);
    console.warn('⚠️  STT service will be unavailable');
  }
} else {
  console.warn('⚠️  GROQ_API_KEY not set. STT service will be unavailable.');
  console.warn('   Please set GROQ_API_KEY in your .env file');
}

/**
 * Transcribe audio to text
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} language - Language code ('en' or 'hi')
 * @returns {Promise<string>} Transcribed text
 */
async function transcribeAudio(audioBuffer, language = 'en') {
  if (!groqClient) {
    throw new Error('STT service not available. GROQ_API_KEY may be missing or invalid.');
  }

  if (!audioBuffer || !Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
    throw new Error('Audio buffer is required and must be non-empty');
  }

  // Limit audio size to prevent abuse (max 25MB for Groq)
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (audioBuffer.length > maxSize) {
    throw new Error('Audio file too large. Maximum size is 25MB.');
  }

  // Map language code for Whisper
  const whisperLang = language === 'hi' || language === 'hindi' ? 'hi' : 'en';

  // Create a temporary file to use with fs.createReadStream
  // Groq SDK accepts fs.ReadStream which is the most reliable method
  let tempFilePath = null;

  try {
    console.log('[STT] Transcribing audio...', {
      audioSize: audioBuffer.length,
      language: whisperLang,
    });

    // Write buffer to temporary file
    tempFilePath = path.join(os.tmpdir(), `stt-${Date.now()}-${Math.random().toString(36).substring(7)}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    console.log('[STT] Using Groq SDK for transcription...');

    // Use Groq SDK's audio transcription API with fs.ReadStream
    // This is the most reliable method according to Groq SDK docs
    const transcription = await groqClient.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-large-v3-turbo', // Use turbo model for faster processing
      language: whisperLang,
      response_format: 'text',
    });

    // Extract text from response
    // Groq SDK returns different formats depending on response_format
    let text = '';
    if (typeof transcription === 'string') {
      text = transcription;
    } else if (transcription?.text) {
      text = transcription.text;
    } else if (transcription?.data?.text) {
      text = transcription.data.text;
    } else if (transcription?.transcription) {
      text = transcription.transcription;
    } else {
      // Try to stringify and extract
      const str = String(transcription);
      if (str && str.trim().length > 0) {
        text = str;
      } else {
        console.error('[STT] Unexpected response format:', transcription);
        throw new Error('Unexpected response format from Groq API');
      }
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Empty transcription received');
    }

    console.log('[STT] Transcription successful', {
      textLength: text.length,
      preview: text.substring(0, 50),
    });

    return text.trim();
  } catch (err) {
    console.error('[STT] Error transcribing audio:', {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    });

    // Provide user-friendly error messages
    let errorMessage = 'STT service temporarily unavailable. Please try again later.';
    
    if (err.message?.includes('Invalid value') || err.message?.includes('expected')) {
      errorMessage = 'Audio file format error. The SDK could not process the audio file.';
    } else if (err.message?.includes('API key') || err.message?.includes('authentication') || err.message?.includes('401')) {
      errorMessage = 'STT API key is invalid or missing. Please check your GROQ_API_KEY.';
    } else if (err.message?.includes('quota') || err.message?.includes('429')) {
      errorMessage = 'STT API quota exceeded. Please try again later.';
    } else if (err.message?.includes('too large') || err.message?.includes('413')) {
      errorMessage = 'Audio file is too large. Please record a shorter message.';
    } else if (err.message?.includes('multipart') || err.message?.includes('EOF')) {
      errorMessage = 'Audio file format error. Please try recording again.';
    } else if (err.message?.includes('not available')) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupErr) {
        console.warn('[STT] Failed to delete temp file:', cleanupErr.message);
      }
    }
  }
}

module.exports = {
  transcribeAudio,
};
