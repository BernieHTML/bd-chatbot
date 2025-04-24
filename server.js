require("dotenv").config({ path: "/etc/secrets/server.env" });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // Ensure node-fetch is installed
const app = express();

app.use(cors());
app.options("*", cors()); // 👈 Handles preflight OPTIONS requests

app.use(bodyParser.json());

const apiKey = process.env.OPENROUTER_API_KEY;
const baseUrl = "https://openrouter.ai/api/v1";

const PREAMBLE = `You are a helpful AI assistant named TexFlow, representing a Blue Mountains-based web design agency.

The agency offers two services:
1. **TexFlow AI Chatbots** – For small businesses. These are smart, customizable chatbots with booking capabilities.
2. **iPhone Repairs** – Fast, affordable, and local. We repair iPhone screens and batteries only.

Answer all customer service questions. Keep initial responses under 20 words. Be helpful, friendly, and concise.`;


// Chat endpoint


app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    console.log("User message received:", userMessage);

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "anthropic/claude-3.7-sonnet", // Change if needed
                messages: [
                    { role: "system", content: PREAMBLE },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 100
            })
        });

        const text = await response.text();
console.log("Raw OpenRouter response:", text);

let data;
try {
  data = JSON.parse(text);
} catch (e) {
  console.error("❌ Failed to parse JSON:", e);
  return res.json({ reply: "⚠️ Invalid JSON from OpenRouter", raw: text });
}


        if (data.choices && data.choices.length > 0) {
            res.json({ reply: data.choices[0].message.content.trim() });
        } else {
            throw new Error("Invalid response from OpenRouter");
        }
    } catch (error) {
        console.error("Error getting AI response:", error);
        res.json({ reply: "Error processing request." });
    }
});

const PORT = process.env.PORT || 3002;
const HOST = "0.0.0.0"; // Allows external access

app.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
});





  