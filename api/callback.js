import { TwitterApi } from 'twitter-api-v2';

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
      redirectUri: 'https://angelpurgatory.com/callback',
    });

    // Store these tokens securely (recommend using a database)
    // For this example, we'll use environment variables (NOT recommended in production)
    process.env.TWITTER_ACCESS_TOKEN = accessToken;
    process.env.TWITTER_REFRESH_TOKEN = refreshToken;

    // Redirect or respond as needed
    res.redirect('https://angelpurgatory.com/success');
  } catch (error) {
    console.error('OAuth 2.0 Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}