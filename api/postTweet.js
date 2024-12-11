import { TwitterApi } from 'twitter-api-v2';

// Helper function to securely store tokens (replace with your actual storage method)
async function storeTokens(tokens) {
  // Implement secure token storage:
  // - Use a database like Vercel KV, Supabase, or Firestore
  // - Or use Vercel Environment Variables API
  // Example using environment variables (not recommended for production)
  process.env.TWITTER_ACCESS_TOKEN = tokens.accessToken;
  process.env.TWITTER_REFRESH_TOKEN = tokens.refreshToken;
}

// Helper function to retrieve stored tokens
async function retrieveStoredTokens() {
  return {
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    refreshToken: process.env.TWITTER_REFRESH_TOKEN
  };
}

export default async function handler(req, res) {
  // CORS Configuration
  const allowedOrigins = [
    "https://angel-world.webflow.io",
    "https://angelpurgatory.com",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const tweetText = req.body.confession;
      
      if (!tweetText || tweetText.trim().length === 0) {
        return res.status(400).json({ error: "Confession text cannot be empty" });
      }

      const { 
        TWITTER_CLIENT_ID, 
        TWITTER_CLIENT_SECRET 
      } = process.env;

      // Retrieve stored tokens
      const storedTokens = await retrieveStoredTokens();

      if (!storedTokens.accessToken) {
        return res.status(401).json({
          error: 'No valid Twitter authentication',
          redirectUrl: '/api/twitter-auth'
        });
      }

      const client = new TwitterApi({
        clientId: TWITTER_CLIENT_ID,
        clientSecret: TWITTER_CLIENT_SECRET,
        accessToken: storedTokens.accessToken,
        refreshToken: storedTokens.refreshToken,
      });

      try {
        const tweet = await client.v2.tweet(tweetText);
        
        return res.status(200).json({ 
          success: true, 
          data: tweet 
        });
      } catch (apiError) {
        // Enhanced token refresh logic
        if (apiError.data?.title === 'Unauthorized' || apiError.statusCode === 401) {
          try {
            const refreshResponse = await client.refreshOAuth2Token();
            
            // Securely store new tokens
            await storeTokens({
              accessToken: refreshResponse.accessToken,
              refreshToken: refreshResponse.refreshToken
            });

            const refreshedClient = new TwitterApi({
              clientId: TWITTER_CLIENT_ID,
              clientSecret: TWITTER_CLIENT_SECRET,
              accessToken: refreshResponse.accessToken,
              refreshToken: refreshResponse.refreshToken,
            });

            const retryTweet = await refreshedClient.v2.tweet(tweetText);

            return res.status(200).json({ 
              success: true, 
              data: retryTweet,
              message: 'Tweet posted after token refresh'
            });
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            return res.status(401).json({
              error: 'Twitter authentication failed to refresh',
              redirectUrl: '/api/twitter-auth'
            });
          }
        }

        console.error('Twitter API Error:', apiError);
        return res.status(500).json({ 
          error: 'Failed to post to Twitter',
          details: apiError.message 
        });
      }
    } catch (error) {
      console.error('Server-side error:', error);
      return res.status(500).json({ 
        error: 'Unexpected server error',
        details: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
