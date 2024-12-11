import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  const client = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  });

  // Generate the authorization URL with the correct callback URL
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
    'https://an-gel.vercel.app/callback', 
    { 
      scope: ['tweet.write', 'users.read'] 
    }
  );

  // Store codeVerifier and state in environment variables
  process.env.TWITTER_CODE_VERIFIER = codeVerifier;
  process.env.TWITTER_AUTH_STATE = state;

  // Redirect user to Twitter's authorization page
  res.redirect(url);
}
