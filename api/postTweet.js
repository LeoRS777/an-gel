import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  // CORS Headers
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

  // Main logic
  if (req.method === "POST") {
    try {
      const tweetText = req.body.confession;
      
      // Validate input
      if (!tweetText || tweetText.trim().length === 0) {
        return res.status(400).json({ error: "Confession text cannot be empty" });
      }

      const { 
        TWITTER_ACCESS_TOKEN, 
        TWITTER_REFRESH_TOKEN, 
        TWITTER_CLIENT_ID, 
        TWITTER_CLIENT_SECRET 
      } = process.env;
      
      // If no access token, redirect to OAuth flow
      if (!TWITTER_ACCESS_TOKEN) {
        return res.status(401).json({
          error: 'No valid Twitter authentication',
          redirectUrl: '/api/twitter-auth'
        });
      }

      // Initialize Twitter client
      const client = new TwitterApi({
        clientId: TWITTER_CLIENT_ID,
        clientSecret: TWITTER_CLIENT_SECRET,
        accessToken: TWITTER_ACCESS_TOKEN,
        refreshToken: TWITTER_REFRESH_TOKEN,
      });

      try {
        // Attempt to post the tweet
        const tweet = await client.v2.tweet(tweetText);
        
        return res.status(200).json({ 
          success: true, 
          data: tweet 
        });
      } catch (apiError) {
        // Check if error is due to token expiration
        if (apiError.data?.title === 'Unauthorized' || apiError.statusCode === 401) {
          try {
            // Attempt to refresh the token
            const refreshResponse = await client.refreshOAuth2Token();
            
            // Update environment variables with new tokens
            // Note: In a real-world scenario, you'd want a more secure way to update these
            process.env.TWITTER_ACCESS_TOKEN = refreshResponse.accessToken;
            process.env.TWITTER_REFRESH_TOKEN = refreshResponse.refreshToken;

            // Retry the tweet with the new token
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
            // If token refresh fails, redirect to OAuth flow
            console.error('Token refresh failed:', refreshError);
            return res.status(401).json({
              error: 'Twitter authentication failed to refresh',
              redirectUrl: '/api/twitter-auth'
            });
          }
        }

        // Log and return other types of errors
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
