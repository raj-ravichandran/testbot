# Thanglish Bot 🗣️

A chatbot that always replies in **Thanglish** (Tamil + English mixed, Roman script),
powered by a free open-source LLM via [Groq](https://groq.com) (Llama 3.3 70B).

- **Frontend:** plain HTML/CSS/JS chat widget (`public/index.html`)
- **Backend:** one serverless function (`api/chat.js`) that calls Groq's OpenAI-compatible API
- **Hosting:** GitHub (source) + Vercel (free deploy, frontend + backend together)

Your API key stays server-side only — it's never exposed to the browser.

---

## 1. Get a free Groq API key

1. Go to https://console.groq.com and sign up (free).
2. Go to **API Keys** → **Create API Key**.
3. Copy the key — you'll need it in step 3 below.

Groq gives free-tier access to open-source models like Llama 3.3 70B, Llama 3.1 8B,
and Gemma 2 — fast inference, no cost for reasonable usage.

---

## 2. Push this project to GitHub

From inside this project folder:

```bash
git init
git add .
git commit -m "Initial commit: Thanglish bot"
git branch -M main
git remote add origin https://github.com/<your-username>/thanglish-bot.git
git push -u origin main
```

(Create the empty repo on GitHub first at https://github.com/new — don't initialize it
with a README, since you already have one here.)

---

## 3. Deploy on Vercel (free)

1. Go to https://vercel.com and sign in with your GitHub account.
2. Click **Add New → Project**, then select your `thanglish-bot` repo.
3. Vercel will auto-detect the config from `vercel.json` — no build settings needed.
4. Before deploying, add your environment variable:
   - Go to **Environment Variables**
   - Key: `GROQ_API_KEY`
   - Value: *(paste the key from step 1)*
5. Click **Deploy**.

In about a minute you'll get a live URL like `https://thanglish-bot.vercel.app` —
open it and start chatting.

---

## 4. Run it locally (optional)

```bash
npm install -g vercel
vercel dev
```

Create a `.env` file (copy `.env.example`) with your real key before running locally.

---

## Customizing the Thanglish style

Edit the `SYSTEM_PROMPT` in `api/chat.js` — it controls tone, slang density, and
formality. A few example exchanges are baked into the prompt already; add more
examples there if you want the bot to match a specific style more closely
(e.g. more formal, more slang-heavy, Chennai vs Madurai flavor, etc.)

## Switching models

Groq also serves `llama-3.1-8b-instant` (faster, smaller) and `gemma2-9b-it`.
Change the `GROQ_MODEL` environment variable in Vercel to switch — no code changes needed.

## Cost

Groq's free tier is generous for a personal/demo chatbot. Vercel's free (Hobby) tier
covers this project's hosting needs comfortably as well.
