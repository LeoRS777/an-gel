import { TwitterApi } from 'twitter-api-v2';

// Helper function to securely store tokens (replace with your actual storage method)
async function storeTokens(tokens) {
  // Implement secure token storage:
  // - Use a database like Vercel KV, Supabase, or Firestore
  // - Or use Vercel Environment Variables API
  process.env.TWITTER_ACCESS_TOKEN = tokens.accessToken;
  process.env.TWITTER_REFRESH_TOKEN = tokens.refreshToken;
}

export default async function handler(req, res) {
  const { state, code } = req.query;

  // Validate the state to prevent CSRF
  if (state !== process.env.TWITTER_AUTH_STATE) {
    return res.status(400).json({ error: 'Invalid state' });
  }

  const client = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  });

  try {
    // Exchange the authorization code for access tokens
    const {
      client: userClient,
      accessToken,
      refreshToken,
    } = await client.loginWithOAuth2({
      code,
      codeVerifier: process.env.TWITTER_CODE_VERIFIER,
      redirectUri: 'https://an-gel.vercel.app/callback',
    });

    // Securely store tokens
    await storeTokens({ accessToken, refreshToken });

    // Redirect to success page on your frontend
    res.redirect('https://angelpurgatory.com/success');
  } catch (error) {
    console.error('OAuth 2.0 Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
