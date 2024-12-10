import axios from "axios/dist/node/axios.cjs";
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

      // Check if we have a valid access token
      const accessToken = process.env.TWITTER_ACCESS_TOKEN;
      
      // If no access token, redirect to OAuth flow
      if (!accessToken) {
        return res.status(401).json({
          error: 'No valid Twitter authentication',
          redirectUrl: '/api/twitter-auth'
        });
      }

      // Initialize Twitter client
      const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
      });

      try {
        // Create a user client with the access token
        const userClient = new TwitterApi(accessToken);

        // Attempt to post the tweet
        const tweet = await userClient.v2.tweet(tweetText);
        
        return res.status(200).json({ 
          success: true, 
          data: tweet 
        });
      } catch (apiError) {
        // Check if error is due to token expiration or invalid token
        if (apiError.data?.title === 'Unauthorized' || apiError.statusCode === 401) {
          return res.status(401).json({
            error: 'Twitter authentication expired',
            redirectUrl: '/api/twitter-auth'
          });
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
