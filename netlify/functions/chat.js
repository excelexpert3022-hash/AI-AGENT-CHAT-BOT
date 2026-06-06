exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { message, history } = JSON.parse(event.body);

    const GEMINI_KEY = process.env.GEMINI_KEY;
    const GROQ_KEY = process.env.GROQ_KEY;
    const CLAUDE_KEY = process.env.CLAUDE_KEY;

    // Smart Routing Logic
    const msg = message.toLowerCase();
    const isExcel = /excel|sheets|formula|vlookup|xlookup|pivot|vba|macro|power query|dashboard|sumifs|index|match|lambda|filter|countifs|conditional format/i.test(msg);
    const isCode = /python|javascript|code|script|function|debug|error|programming|html|css|sql/i.test(msg);
    const isLatest = /today|latest|news|current|2024|2025|2026|price|weather|stock|trending/i.test(msg);

    let aiUsed = '';
    let reply = '';

    if (isExcel) {
      // Claude — best for Excel/Sheets/analysis
      aiUsed = 'Claude (Excel Expert)';
      const systemPrompt = `You are Ahmed Tech Agent — a senior Excel consultant and automation specialist for Ahmed Tech Solutions, Karachi. 
      Technology priority: Formulas → Dynamic Arrays → Tables → Conditional Formatting → Pivot Tables → Power Query → Power Pivot → VBA → Python (last resort).
      Give practical, client-ready Excel/Sheets solutions. Use Roman Urdu mixed with English in your response.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...(history || []), { role: 'user', content: message }]
        })
      });
      const data = await res.json();
      reply = data.content?.[0]?.text || 'Error: ' + JSON.stringify(data);

    } else if (isLatest) {
      // Gemini — for latest/current info
      aiUsed = 'Gemini (Latest Info)';
      const geminiHistory = (history || []).map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [...geminiHistory, { role: 'user', parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: 'You are Ahmed Tech Agent. Answer in Roman Urdu mixed with English. Be concise and practical.' }] }
        })
      });
      const data = await res.json();
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini se jawab nahi aaya.';

    } else {
      // Groq (Llama) — fast, general purpose
      aiUsed = 'Groq Llama (Fast)';
      const groqHistory = (history || []).map(h => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content
      }));

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: 'You are Ahmed Tech Agent — a helpful consultant for Ahmed Tech Solutions, Karachi. Answer in Roman Urdu mixed with English. Be practical and concise.' },
            ...groqHistory,
            { role: 'user', content: message }
          ],
          max_tokens: 1000
        })
      });
      const data = await res.json();
     reply = data.choices?.[0]?.message?.content || 'Error: ' + JSON.stringify(data);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, aiUsed })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ reply: 'Server error: ' + err.message, aiUsed: 'Error' })
    };
  }
};
