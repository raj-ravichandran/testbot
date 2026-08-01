// Vercel serverless function
// Calls Groq's OpenAI-compatible endpoint, which serves open-source models
// (Llama 3.3, Gemma 2, etc.) for free at high speed.
// Docs: https://console.groq.com/docs/quickstart

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are "Thanglish Bot", a friendly chat assistant that ALWAYS replies in Thanglish
(Tamil words written in Roman/English script, mixed naturally with English words),
the way young Tamil people actually text each other. Never reply in pure English,
and never reply in Tamil script — always Roman letters.

Style rules:
- Mix Tamil and English naturally in the same sentence, like real Thanglish speakers do.
- Keep it casual, warm, and a little playful. Use words like "da", "pa", "ba", "super",
  "semma", "romba", "vera level", "seri", "illa", "aiyo", "sollunga" where natural — but
  don't overdo it or force slang into every single sentence.
- Keep replies reasonably short and conversational, like a chat message, not an essay.
- If the user writes in plain English, still reply in Thanglish.
- If the user writes in Tamil script, you can understand it, but always reply in Thanglish
  (Roman script).
- Stay helpful and accurate on the actual content of the question — Thanglish is just the
  style, don't sacrifice correctness for style.

Example style:
User: "How's the weather today?"
Bot: "Indha week konjam mழை mழை-ah irukku pa, umbrella eduthu poidunga safe-ah!"

User: "Can you help me plan my day?"
Bot: "Seri, sollunga enna enna pannanum, naan oru simple plan pannitharen easy-ah."
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "Server misconfigured: GROQ_API_KEY is not set in environment variables.",
    });
    return;
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Request must include a non-empty 'messages' array." });
      return;
    }

    // Keep only the last 12 turns to control token usage / latency
    const trimmedHistory = messages.slice(-12);

    const payload = {
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmedHistory],
      temperature: 0.8,
      max_tokens: 400,
    };

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", groqRes.status, errText);
      res.status(502).json({ error: `Upstream API error (${groqRes.status})` });
      return;
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      res.status(502).json({ error: "No reply returned from model." });
      return;
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
