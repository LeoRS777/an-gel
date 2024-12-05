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
      const bearerToken = "AAAAAAAAAAAAAAAAAAAAAAHsxAEAAAAACfJ2foBMSwXO3LLkWMhaLAIc%2Bww%";
      const url = "https://api.x.com/2/tweets";  // Instead of twitter.com
      const headers = {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      };
      const payload = { text: tweetText };

      const response = await axios.post(url, payload, { headers });
      return res.status(200).json({ success: true, data: response.data });
    } catch (error) {
      console.error('Tweet posting error:', error);
      return res.status(500).json({ 
        error: error.response?.data || error.message 
      });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

