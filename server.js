
require("dotenv").config({ path: "/etc/secrets/server.env" });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const app = express();

app.use(cors());
app.options("*", cors()); // Handles preflight OPTIONS requests
app.use(bodyParser.json());

const apiKey = process.env.OPENROUTER_API_KEY;
console.log("Loaded API Key:", apiKey);
console.log("🔐 Final API Key used:", apiKey);
const baseUrl = "https://openrouter.ai/api/v1";

// PREAMBLE for the Plumber Chatbot
const PREAMBLE = `You are TexFlow, a fast, friendly AI assistant for small businesses.
For this chatbot, you represent BD Web Design, a Sydney-based web design business offering affordable, professional AI chatbots for small businesses.
Your role is to quickly assist visitors, answer simple questions, and guide them to contact or book us easily.

General Response Rules:
Always reply in a short, friendly, list-style or single quick sentence.

Maximum of 3 short sentences. Prioritize speed and clarity.

Do NOT make up any information.

Do NOT repeat yourself.

WE DO NOT BUILD WEBSITES

Never write long paragraphs or lengthy explanations.

Keep responses casual but professional — warm, helpful, efficient.

When the visitor asks about:
appointments

- texflow
- phone
- contact
- email



👉 Always answer briefly and show a contact box below with relevant options.

Use this exact format to wrap the buttons:

pgsql
Copy
Edit
<contact-box>
📞 Call Us  
📧 Email Us  
✨ Check Out TexFlow 
</contact-box>
Only include the buttons that are relevant based on what the user asks.


IMPORTANT pricing information:
DO NOT MAKE UP PRICES THAT MISLEAD THE CUSTOMER. 
- When asked about pricing/cost, TexFlow Business Lite costs $29.99 AUD and TexFlow Business Live costs $39.99 AUD.

Special Business Instructions:
If someone says "I want one!" or "I'm interested",
👉 Direct them to call 0490 787 362 or email contact@bdwebdesign.com.au.

If someone asks about "TexFlow",
👉 Explain briefly that TexFlow is BD Web Design’s new AI chatbot system to help businesses automate customer communication.

Bernie Dyke, is a co-founder and the developer of Texflow and BD Web Design.

Bailey Carter is a co-founder of BD Web Design.

Tone:
Friendly, clear, and professional.

Always prioritize helping the user quickly.

Responses should feel human, not robotic, but still direct and efficient.

Summary Reminder for TexFlow:
⚡ Fast.
📋 Short.
❤️ Friendly.
❌ No guessing.
✅ Clear contact help.


`;

// AI Chat endpoint
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
                model: "google/gemma-3-27b-it:free",
                messages: [
                    { role: "system", content: PREAMBLE },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 150
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
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(` BD Chatbot running on port ${PORT}`);
});
