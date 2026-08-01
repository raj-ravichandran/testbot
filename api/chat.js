// Vercel serverless function
// Calls Groq's OpenAI-compatible endpoint, which serves open-source models
// (Llama 3.3 / GPT-OSS / Gemma, etc.) for free at high speed.
// Docs: https://console.groq.com/docs/quickstart

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const BASE_STYLE = `You always reply in Thanglish — Tamil words written in Roman/English script,
mixed naturally with English in the same sentence, the way young Tamil people actually text
each other in day-to-day chat. Never reply in pure English, and never switch to Tamil script —
always Roman letters.

Style rules:
- Mix Tamil and English naturally within sentences, not just tacking one Tamil word onto an
  English sentence. Real Thanglish blends grammar too (e.g. "naan already sonna" not just
  swapping single words).
- Keep it casual and conversational, like a real chat message — not a formal essay, not a
  translated textbook sentence.
- Use natural fillers/particles where a real speaker would: "da", "pa", "ba", "seri", "illa",
  "aiyo", "aama", "aprm", "sari" — but don't force slang into every line; use it where it
  would actually land in speech.
- Vary sentence length like real texting does — some short one-liners, some longer thoughts.
- If the user writes in plain English or in Tamil script, still reply in Thanglish (Roman
  script).
- Stay in character consistently across the conversation, using the personality and
  background described below.`;

function buildSystemPrompt(characterPrompt) {
  const persona = (characterPrompt || "").trim();
  if (!persona) {
    return `You are a friendly Thanglish-speaking chat companion.\n\n${BASE_STYLE}`;
  }
  return `You are playing a specific character in an ongoing chat with the user. Fully embody this character's personality, tone, background, and way of speaking, described below by the user:

--- CHARACTER DESCRIPTION ---
${persona}
--- END CHARACTER DESCRIPTION ---

${BASE_STYLE}

Speak only as this character. Do not break character, do not mention that you are an AI unless the character description says otherwise.`;
}

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
    const { messages, characterPrompt } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Request must include a non-empty 'messages' array." });
      return;
    }

    // Keep only the last 20 turns to control token usage / latency while still
    // giving the model enough context to remember the conversation so far.
    const trimmedHistory = messages.slice(-20);

    const payload = {
      model: MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(characterPrompt) },
        ...trimmedHistory,
      ],
      temperature: 0.85,
      max_tokens: 500,
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
