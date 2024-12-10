import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  const client = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  });

  // Generate the authorization URL
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
    'https://angelpurgatory.com/callback', 
    { 
      scope: ['tweet.write', 'users.read'] 
    }
  );

  // Store codeVerifier and state in a secure, temporary storage 
  // (you might use a database or session storage)
  // For this example, we'll use environment variables as a placeholder
  process.env.TWITTER_CODE_VERIFIER = codeVerifier;
  process.env.TWITTER_AUTH_STATE = state;

  // Redirect user to Twitter's authorization page
  res.redirect(url);
}
