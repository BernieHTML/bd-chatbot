require("dotenv").config({ path: "/etc/secrets/server.env" });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // Ensure node-fetch is installed
const app = express();

app.use(cors());
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
    const { message, botId = "default" } = req.body;
  
    if (!message) {
      return res.status(400).json({ reply: "Missing 'message' field in request." });
    }
  
    console.log("User message received:", message);
    console.log("Bot ID:", botId);
  
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.7-sonnet",
          messages: [
            { role: "system", content: PREAMBLE },
            { role: "user", content: message }
          ],
          max_tokens: 200
        })
      });
  
      const data = await response.json();
      console.log("OpenRouter response:", data);
  
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
  