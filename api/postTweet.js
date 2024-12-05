import axios from "axios/dist/node/axios.cjs";

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

      const bearerToken = process.env.X_BEARER_TOKEN;
      if (!bearerToken) {
        return res.status(500).json({ error: "Twitter API token not configured" });
      }

      const url = "https://api.twitter.com/2/tweets";
      
      const headers = {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      };
      
      const payload = { text: tweetText };

      console.log('Payload:', payload);
      console.log('Headers:', headers);

      try {
        const response = await axios.post(url, payload, { 
          headers,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        });

        console.log('Twitter API Response:', response.data);
        return res.status(200).json({ success: true, data: response.data });
      } catch (apiError) {
        console.error('Twitter API Error:', {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message
        });

        return res.status(500).json({ 
          error: 'Failed to post to Twitter',
          details: apiError.response?.data || apiError.message 
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

