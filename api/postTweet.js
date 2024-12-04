import axios from "axios";

const corsMiddleware = (req, res, next) => {
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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next(); // Continue to the actual handler
};

export default async function handler(req, res) {
  corsMiddleware(req, res, () => {
    // Main logic here
    if (req.method === "POST") {
      const tweetText = req.body.confession;
      const bearerToken =
        "AAAAAAAAAAAAAAAAAAAAAAHsxAEAAAAACfJ2foBMSwXO3LLkWMhaLAIc%2Bww%";

      const url = "https://api.twitter.com/2/tweets";
      const headers = {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      };

      const payload = { text: tweetText };

      axios
        .post(url, payload, { headers })
        .then((response) =>
          res.status(200).json({ success: true, data: response.data })
        )
        .catch((error) =>
          res
            .status(500)
            .json({ error: error.response?.data || error.message })
        );
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  });
}

