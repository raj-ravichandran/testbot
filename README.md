# Thanglish Chat 🗣️

A multi-character chatbot app: create custom characters (name, profile picture, personality),
chat with each in **Thanglish** (Tamil + English mixed, Roman script), and chats persist and
continue across visits. Powered by a free open-source LLM via [Groq](https://groq.com).

- **Frontend:** plain HTML/CSS/JS (`public/index.html`) — no build step, no framework
- **Backend:** one serverless function (`api/chat.js`) that calls Groq's OpenAI-compatible API
- **Storage:** characters and chat history are saved in the browser's `localStorage`, so they
  persist across page reloads/visits on the same browser/device
- **Hosting:** GitHub (source) + Vercel (free deploy, frontend + backend together)

Your Groq API key stays server-side only — it's never exposed to the browser.

---

## Features

- **Create characters** — name, an uploaded profile picture, and a free-text personality/
  background description that fully shapes how they talk and respond
- **Multiple characters, separate chat threads** — switch between them in the sidebar; each
  keeps its own independent conversation history
- **Persistent, continuing chats** — closing the tab and coming back later picks up right
  where you left off, per character
- **Realistic Thanglish** — the system prompt is tuned for natural Tamil-English code-mixing
  (grammar blending, casual particles like "da/pa/seri/aiyo"), not just word-swapping

### A note on content boundaries

Character personalities are fully yours to design — tone, backstory, quirks, relationship to
you, all of it. What this app does **not** do is strip away the underlying model's own safety
behavior; Groq's hosted models apply their standard moderation regardless of the system prompt,
so this isn't an "anything goes, no restrictions" setup even though characters themselves are
very flexible.

---

## 1. Get a free Groq API key

1. Go to https://console.groq.com and sign up (free).
2. Go to **API Keys** → **Create API Key**.
3. Copy the key — you'll need it in step 3 below.

---

## 2. Push this project to GitHub

```bash
git init
git add .
git commit -m "Multi-character Thanglish chat app"
git branch -M main
git remote add origin https://github.com/<your-username>/thanglish-bot.git
git push -u origin main
```

---

## 3. Deploy on Vercel (free)

1. Go to https://vercel.com and sign in with GitHub.
2. **Add New → Project** → select your repo.
3. Before deploying, add an environment variable:
   - Key: `GROQ_API_KEY`
   - Value: *(your key from step 1)*
   - Check all environments (Production, Preview, Development)
4. Click **Deploy**.

Once live, use your project's stable domain — check **Settings → Domains** in Vercel for the
exact URL (it's the one without a random hash in the middle, e.g. `yourproject.vercel.app`).

---

## 4. Run it locally (optional)

```bash
npm install -g vercel
vercel dev
```

Create a `.env` file (copy `.env.example`) with your real key before running locally.

---

## How character personas work

When you create a character, whatever you write in the personality field is sent to the model
as part of the system prompt on every message — it fully drives tone, backstory, and how they
respond, layered on top of the base Thanglish style instructions in `api/chat.js`.

## Data & privacy

Characters and chat history live only in your browser's `localStorage` — nothing is stored on
a server or database. Clearing your browser data, or using a different browser/device, means a
fresh start. If you want cross-device sync later, that would require adding a real database
(e.g. Vercel KV/Postgres) — happy to help wire that up if you need it.

## Switching models

Groq periodically deprecates/replaces models. Check https://console.groq.com/docs/models for
current options, and set `GROQ_MODEL` in Vercel's environment variables to switch — no code
changes needed. Default here is `openai/gpt-oss-120b`.
