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

const PREAMBLE = `You are TexFlow AI, an advanced AI assistant designed for businesses and individuals.
You assist users by providing intelligent chatbot solutions for customer service, automation, and engagement.
Use the provided information to answer inquiries about TexFlow AI's features, services, and capabilities.`;

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
                model: "qwen/qwq-32b:free", // Change if needed
                messages: [
                    { role: "system", content: PREAMBLE },
                    { role: "user", content: userMessage }
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

const PORT = process.env.PORT || 3002;
const HOST = "0.0.0.0"; // Allows external access

app.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
});




