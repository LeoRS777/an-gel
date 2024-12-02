// api/postTweet.js

import axios from "axios";

export default async function handler(req, res) {
  // Define allowed origins
  const allowedOrigins = [
    "https://angel-world.webflow.io",
    "https://angelpurgatory.com.com", // Add other allowed origins here
  ];

  const origin = req.headers.origin;

  // Check if the origin is in the list of allowed origins
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // End the request for preflight
  }

  if (req.method === "POST") {
    // Get the confession (tweet text) from the request body
    const tweetText = req.body.confession; // Assuming Webflow sends 'confession' in the request body
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
      return res
        .status(500)
        .json({ error: error.response?.data || error.message });
    }
  } else {
    // Handle any non-POST requests
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
