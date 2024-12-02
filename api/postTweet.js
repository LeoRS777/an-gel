import axios from "axios";

export default async function handler(req, res) {
  // Define allowed origins
  const allowedOrigins = [
    "https://angel-world.webflow.io",
    "https://angelpurgatory.com", // Fixed typo in domain
  ];

  const origin = req.headers.origin;

  // Set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Use '*' if no specific origin matches
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests (OPTIONS method)
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // End the request for preflight
  }

  // Handle POST requests
  if (req.method === "POST") {
    // Get the confession (tweet text) from the request body
    const tweetText = req.body.confession; // Ensure Webflow sends 'confession' in the request body
    const bearerToken =
      "AAAAAAAAAAAAAAAAAAAAAAHsxAEAAAAACfJ2foBMSwXO3LLkWMhaLAIc%2Bww%"; // Replace with your Bearer token from X API

    const url = "https://api.twitter.com/2/tweets";
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    };

    const payload = { text: tweetText };

    try {
      // Send the tweet
      const response = await axios.post(url, payload, { headers });
      return res.status(200).json({ success: true, data: response.data });
    } catch (error) {
      console.error("Error posting tweet:", error.response?.data || error.message);
      return res
        .status(500)
        .json({ error: error.response?.data || error.message });
    }
  } else {
    // Handle non-POST requests
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}

