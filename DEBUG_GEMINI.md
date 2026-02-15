# Debugging Gemini Integration

If Gemini is not responding, follow these steps:

## 1. Check Backend Logs

When you start the backend server, you should see:
```
✓ GEMINI_API_KEY found
✓ Gemini AI client initialized successfully
```

If you see warnings instead, check the issues below.

## 2. Verify Environment Variables

Check that `backend-node/.env` contains:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** 
- The key should NOT have quotes around it
- No spaces before or after the `=`
- The key should be the full API key from Google AI Studio

## 3. Test Gemini Status Endpoint

After logging in, visit:
```
GET http://localhost:3000/api/assistance/status
```

This will tell you:
- If the API key is set
- If Gemini is initialized
- The length of the API key (for verification)

## 4. Check Server Console

When you make a request, you should see logs like:
```
Assistance request received: { question: '...', language: 'en', ... }
Sending request to Gemini API...
Gemini API response received: { answerLength: 123, preview: '...' }
Assistance response generated successfully
```

If you see errors instead, note the error message.

## 5. Common Issues

### Issue: "Gemini service not configured"
**Solution:** 
- Check `.env` file exists in `backend-node/` directory
- Verify `GEMINI_API_KEY` is set correctly
- Restart the backend server after adding the key

### Issue: "Gemini API key is invalid"
**Solution:**
- Get a new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Make sure you're using the correct key (not a Firebase key)
- Check for typos or extra characters

### Issue: "API quota exceeded"
**Solution:**
- You've hit the free tier limit
- Wait a bit and try again
- Check your Google Cloud Console for quota limits

### Issue: "Authentication failed"
**Solution:**
- Make sure you're logged in
- Check that Firebase auth is working
- Verify `FIREBASE_SERVICE_ACCOUNT` is set in backend `.env`

## 6. Test with Simple Question

Try asking a simple agriculture question:
- "What is irrigation?"
- "Explain crop yield"
- "How does weather affect farming?"

## 7. Check Network Tab

In browser DevTools → Network tab:
- Look for the `/api/assistance/ask` request
- Check the response status code
- Read the error message in the response body

## 8. Verify Dependencies

Make sure dependencies are installed:
```bash
cd backend-node
npm install
```

Check that `@google/generative-ai` is installed:
```bash
npm list @google/generative-ai
```

## 9. Test Direct API Call

You can test the Gemini API directly (replace YOUR_API_KEY):
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"What is irrigation?"}]}]}'
```

If this works but your app doesn't, the issue is in the integration code.

## 10. Enable Detailed Logging

The code now includes detailed console logs. Check your backend terminal for:
- Initialization messages
- Request details
- Response details
- Error messages with stack traces

## Still Not Working?

1. Check that the backend server is running on port 3000
2. Verify CORS is configured correctly
3. Check browser console for frontend errors
4. Verify the API key has proper permissions in Google Cloud Console
