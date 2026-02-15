/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID tokens from Authorization header
 */

const admin = require('firebase-admin');

let firebaseAdminInitialized = false;

function initializeFirebaseAdmin() {
  if (firebaseAdminInitialized) return;
  
  // Check if already initialized
  try {
    if (admin.apps.length > 0) {
      firebaseAdminInitialized = true;
      return;
    }
  } catch {
    // Not initialized yet
  }
  
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set. Auth verification disabled.');
    firebaseAdminInitialized = false;
    return;
  }

  try {
    const serviceAccountJson = JSON.parse(serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });
    firebaseAdminInitialized = true;
    console.log('✓ Firebase Admin initialized');
  } catch (err) {
    console.error('✗ Failed to initialize Firebase Admin:', err.message);
    firebaseAdminInitialized = false;
  }
}

initializeFirebaseAdmin();

/**
 * Middleware to verify Firebase ID token
 * Expects: Authorization: Bearer <token>
 */
async function verifyFirebaseToken(req, res, next) {
  if (!firebaseAdminInitialized) {
    return res.status(503).json({ error: 'Authentication service unavailable' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  verifyFirebaseToken,
};
