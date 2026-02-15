/**
 * Text-to-Speech Service
 * Uses Google Cloud Text-to-Speech API
 */

const textToSpeech = require('@google-cloud/text-to-speech');

// Initialize TTS client
let ttsClient = null;
const GOOGLE_CLOUD_TTS_KEY = process.env.GOOGLE_CLOUD_TTS_KEY;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

function initializeTTSClient() {
  // Try loading from file path first (most reliable)
  if (GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const fs = require('fs');
      const path = require('path');
      const credPath = path.resolve(GOOGLE_APPLICATION_CREDENTIALS);
      
      if (fs.existsSync(credPath)) {
        ttsClient = new textToSpeech.TextToSpeechClient({
          keyFilename: credPath,
        });
        console.log('✓ Google Cloud TTS client initialized from file:', credPath);
        return true;
      } else {
        console.warn('⚠️  GOOGLE_APPLICATION_CREDENTIALS file not found:', credPath);
      }
    } catch (err) {
      console.error('✗ Failed to initialize TTS from file:', err.message);
    }
  }

  // Try loading from JSON string in environment variable
  if (!ttsClient && GOOGLE_CLOUD_TTS_KEY) {
    try {
      // Parse JSON string
      let credentials;
      if (typeof GOOGLE_CLOUD_TTS_KEY === 'string') {
        // Handle escaped JSON strings
        const cleaned = GOOGLE_CLOUD_TTS_KEY.replace(/\\n/g, '\n');
        credentials = JSON.parse(cleaned);
      } else {
        credentials = GOOGLE_CLOUD_TTS_KEY;
      }

      // Validate required fields
      if (!credentials.private_key || !credentials.client_email) {
        throw new Error('Missing required credential fields (private_key or client_email)');
      }

      // Ensure private_key has proper newlines (replace literal \n with actual newlines)
      if (credentials.private_key && typeof credentials.private_key === 'string') {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }

      // Initialize client
      ttsClient = new textToSpeech.TextToSpeechClient({
        credentials,
      });
      console.log('✓ Google Cloud TTS client initialized from environment variable');
      return true;
    } catch (err) {
      console.error('✗ Failed to initialize Google Cloud TTS:', err.message);
      console.error('  Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack?.split('\n').slice(0, 3).join('\n'),
      });
      console.warn('⚠️  TTS service will be unavailable');
      return false;
    }
  }

  // Try default credentials (if running on GCP or with gcloud auth)
  if (!ttsClient) {
    try {
      ttsClient = new textToSpeech.TextToSpeechClient();
      console.log('✓ Google Cloud TTS client initialized with default credentials');
      return true;
    } catch (err) {
      console.warn('⚠️  Could not initialize TTS with default credentials:', err.message);
    }
  }

  if (!ttsClient) {
    console.warn('⚠️  GOOGLE_CLOUD_TTS_KEY or GOOGLE_APPLICATION_CREDENTIALS not set.');
    console.warn('   Please set one of these in your .env file:');
    console.warn('   - GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json (recommended)');
    console.warn('   - GOOGLE_CLOUD_TTS_KEY={"type":"service_account",...} (JSON string)');
  }

  return false;
}

// Initialize on module load
initializeTTSClient();

/**
 * Voice mapping for different languages and genders
 */
const VOICE_MAP = {
  'en': {
    'female': 'en-US-Journey-F',
    'male': 'en-US-Journey-D',
  },
  'hi': {
    'female': 'hi-IN-Neural2-A',
    'male': 'hi-IN-Neural2-B',
  },
};

/**
 * Get voice name for language and gender
 */
function getVoiceName(lang, voice) {
  const normalizedLang = lang === 'hi' || lang === 'hindi' ? 'hi' : 'en';
  const normalizedVoice = voice === 'male' ? 'male' : 'female';
  
  return VOICE_MAP[normalizedLang]?.[normalizedVoice] || VOICE_MAP['en']['female'];
}

/**
 * Get language code for TTS
 */
function getLanguageCode(lang) {
  return lang === 'hi' || lang === 'hindi' ? 'hi-IN' : 'en-US';
}

/**
 * Convert text to speech
 * @param {string} text - Text to convert
 * @param {string} lang - Language code ('en' or 'hi')
 * @param {string} voice - Voice gender ('male' or 'female')
 * @returns {Promise<Buffer>} MP3 audio bytes
 */
async function textToSpeechAudio(text, lang = 'en', voice = 'female') {
  if (!ttsClient) {
    const errorMsg = 'TTS service not available. GOOGLE_CLOUD_TTS_KEY may be missing or invalid.';
    console.error('[TTS]', errorMsg);
    throw new Error(errorMsg);
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Text is required and must be a non-empty string');
  }

  // Limit text length to prevent abuse
  const maxLength = 5000;
  const cleanText = text.trim().substring(0, maxLength);

  const request = {
    input: { text: cleanText },
    voice: {
      languageCode: getLanguageCode(lang),
      name: getVoiceName(lang, voice),
      ssmlGender: voice === 'male' ? 'MALE' : 'FEMALE',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0,
    },
  };

  try {
    console.log('[TTS] Generating audio...', {
      textLength: cleanText.length,
      language: getLanguageCode(lang),
      voice: getVoiceName(lang, voice),
    });

    const [response] = await ttsClient.synthesizeSpeech(request);

    if (!response) {
      throw new Error('No response received from TTS service');
    }

    if (!response.audioContent) {
      console.error('[TTS] Response structure:', {
        hasAudioContent: !!response.audioContent,
        responseKeys: Object.keys(response),
      });
      throw new Error('No audio content in TTS response');
    }

    const audioBuffer = Buffer.from(response.audioContent, 'base64');

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio buffer is empty after decoding');
    }

    console.log('[TTS] Audio generated successfully', {
      audioSize: audioBuffer.length,
    });

    return audioBuffer;
  } catch (err) {
    console.error('[TTS] Error generating audio:', {
      message: err.message,
      name: err.name,
      code: err.code,
      details: err.details,
      stack: err.stack,
    });

    // Provide user-friendly error messages
    let errorMessage = 'TTS service temporarily unavailable. Please try again later.';
    
    // Handle decoder/credential errors specifically
    if (err.message?.includes('DECODER') || err.message?.includes('decoder') || err.message?.includes('unsupported')) {
      errorMessage = 'TTS credentials error: Invalid or corrupted credentials. Please check your GOOGLE_CLOUD_TTS_KEY format. Ensure private_key uses \\n for newlines.';
    } else if (err.code === 2 || err.message?.includes('UNKNOWN')) {
      if (err.message?.includes('metadata') || err.message?.includes('plugin')) {
        errorMessage = 'TTS credentials error: Invalid credentials format. Check that your private_key is properly formatted with \\n for newlines.';
      } else {
        errorMessage = 'TTS service error: ' + (err.message || 'Unknown error');
      }
    } else if (err.code === 7 || err.message?.includes('PERMISSION_DENIED')) {
      errorMessage = 'TTS service: Permission denied. Check your Google Cloud credentials and IAM permissions.';
    } else if (err.code === 16 || err.message?.includes('UNAUTHENTICATED')) {
      errorMessage = 'TTS service: Authentication failed. Check your credentials.';
    } else if (err.message?.includes('API key') || err.message?.includes('credentials')) {
      errorMessage = 'TTS API key is invalid or missing.';
    } else if (err.message?.includes('quota') || err.code === 8) {
      errorMessage = 'TTS API quota exceeded. Please try again later.';
    } else if (err.message?.includes('not available')) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

module.exports = {
  textToSpeechAudio,
};
