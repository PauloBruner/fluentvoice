import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/* 🔊 VOZ PREMIUM */
app.post("/tts", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "pt-BR",
            name: "pt-BR-Neural2-B"
          },
          audioConfig: { audioEncoding: "MP3" }
        })
      }
    );

    const data = await response.json();
    res.json({ audio: data.audioContent });

  } catch {
    res.status(500).json({ error: "TTS failed" });
  }
});

/* 🧠 FEEDBACK DE PRONÚNCIA (OPENAI) */
app.post("/pronunciation-feedback", async (req, res) => {
  const { original, spoken } = req.body;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a language pronunciation coach. Compare texts and give short, practical feedback."
            },
            {
              role: "user",
              content:
                `Original: ${original}\nUser pronunciation: ${spoken}`
            }
          ]
        })
      }
    );

    const data = await response.json();
    res.json({ feedback: data.choices[0].message.content });

  } catch {
    res.status(500).json({ error: "AI feedback failed" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("FluentVoice backend running");
});
