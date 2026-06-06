# Ahmed Tech Agent — Netlify Deployment Guide

## Files
- index.html — Frontend (chat UI)
- netlify/functions/chat.js — Backend (AI routing)
- netlify.toml — Netlify config

## Netlify Deploy Steps

### Step 1 — GitHub pe upload karo
1. github.com pe new repository banao: `ahmed-ai-agent`
2. In teeno files ko upload karo (folder structure maintain karo)

### Step 2 — Netlify connect karo
1. netlify.com > Add new site > Import from Git
2. GitHub repo select karo
3. Build settings: sab blank chhodo (static site hai)
4. Deploy Site click karo

### Step 3 — Environment Variables daalo (IMPORTANT)
1. Netlify Dashboard > Site Settings > Environment Variables
2. Ye 3 variables add karo:
   - Key: GEMINI_KEY   | Value: [aapki Gemini API key]
   - Key: GROQ_KEY     | Value: [aapki Groq API key]  
   - Key: CLAUDE_KEY   | Value: [aapki Claude API key]
3. Save karo

### Step 4 — Redeploy
1. Deploys tab > Trigger deploy > Deploy site

## Routing Logic
- Excel/Sheets/Formula/VBA/Dashboard query → Claude Haiku
- Latest news/price/current info → Gemini 1.5 Flash
- General questions → Groq Llama 3 (fastest)

## Live URL
Deploy hone ke baad aapko milega: https://[random-name].netlify.app
Custom domain bhi laga sakte ho Netlify settings mein.
